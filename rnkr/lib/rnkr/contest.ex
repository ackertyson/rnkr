defmodule Rnkr.Contest do
  use GenStateMachine, callback_mode: :state_functions

  alias Rnkr.{Contest, Contestant, Voter}

  @enforce_keys [:name, :contestants]
  defstruct [:name, :contestants]

  @type t :: %__MODULE__{name: String.t(), contestants: %{String.t() => Contestant.t()}}

  @timeout 150_000

  @spec start_link(String.t(), nonempty_list(String.t())) :: :ignore | {:error, any} | {:ok, pid}
  def start_link(name, contestant_names) do
    contestants =
      Enum.reduce(contestant_names, %{}, fn contestant_name, acc ->
        {:ok, contestant} = Contestant.new(contestant_name)
        Map.put(acc, contestant_name, contestant)
      end)

    GenStateMachine.start_link(
      __MODULE__,
      {name, contestants, contestant_names},
      name: via_tuple(name),
      timeout: @timeout
    )
  end

  def init({name, contestants, contestant_names}) do
    {:ok, contest} = Contest.new(name, contestants)
    {:ok, :preparing, %{contest: contest, contestant_order: contestant_names}}
  end

  ### PUBLIC INTERFACE

  @spec new(String.t(), nonempty_list(Rnkr.Contestant.t())) :: {:ok, Rnkr.Contest.t()}
  def new(name, contestants) do
    {:ok, %Contest{name: name, contestants: contestants}}
  end

  def open_voting(pid) do
    GenStateMachine.cast(pid, :begin)
  end

  def join(pid, username) do
    GenStateMachine.call(pid, {:join, username})
  end

  def get_scores(pid) do
    GenStateMachine.call(pid, :get_scores)
  end

  def request_score_fetch(pid, data) do
    GenStateMachine.cast(pid, {:request_score_fetch, data})
  end

  def close_voting(pid) do
    GenStateMachine.cast(pid, :end)
  end

  def via_tuple(name), do: {:via, Registry, {Registry.Rnkr, name}}

  ### PRIVATE METHODS

  defp calculate_scores(contestants) do
    Enum.reduce(Map.values(contestants), %{}, fn %Contestant{name: name, score: score}, acc ->
      Map.put(acc, name, score)
    end)
  end

  defp record_scores(contestants, scores) do
    Enum.reduce(Map.values(contestants), %{}, &with_updated_score(&1, &2, scores))
  end

  defp with_updated_score(%Contestant{name: name, score: score} = contestant, acc, scores) do
    case Map.has_key?(scores, name) do
      true ->
        Map.put(acc, name, %Contestant{contestant | score: score + scores[name]})

      _ ->
        acc
    end
  end

  ### EVENT CALLBACKS

  def preparing(:cast, :begin, data) do
    {:next_state, :voting, data}
  end

  def preparing(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def voting(
        {:call, from},
        {:join, username},
        %{
          contest: %{name: contest_name},
          contestant_order: contestant_order
        } = data
      ) do
    [a | [b | others]] = contestant_order
    Process.flag(:trap_exit, true)
    {:ok, _} = Voter.start_link(contest_name, username, contestant_order)
    # shift first contestant name to end of order (round robin for subsequent voters)
    new_contestant_order = [b | others] ++ [a]

    {:keep_state, %{data | contestant_order: new_contestant_order}, [{:reply, from, :ok}]}
  end

  def voting(
        :cast,
        {:request_score_fetch, voter_pid},
        %{contest: %Contest{contestants: contestants} = contest} = data
      ) do
    {:ok, scores} = Voter.get_scores(voter_pid)
    new_contestants = record_scores(contestants, scores)
    new_contest = %Contest{contest | contestants: new_contestants}
    {:keep_state, %{data | contest: new_contest}}
  end

  def voting(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def done(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  ## JOIN outside of VOTING state
  def handle_event({:call, from}, {:join, _}, _) do
    {:keep_state_and_data,
     [{:reply, from, {:error, {:reason, "Contest not found or is closed"}}}]}
  end

  ## events valid in ANY state

  def handle_event(
        {:call, from},
        :get_scores,
        %{contest: %Contest{contestants: contestants}}
      ) do
    {:keep_state_and_data, [{:reply, from, {:ok, calculate_scores(contestants)}}]}
  end

  def handle_event(:cast, :end, data) do
    {:next_state, :done, data}
  end

  ## CATCH-ALLS

  def handle_event(:cast, _, _) do
    :keep_state_and_data
  end

  def handle_event({:call, from}, _, _) do
    {:keep_state_and_data, [{:reply, from, {:error, {:reason, "Unknown contest command"}}}]}
  end

  def handle_info(:timeout, data) do
    {:stop, {:shutdown, :timeout}, data}
  end

  def handle_info(:exit, {pid, _}, reason) do
    IO.puts("Child process exited")
    IO.puts(pid)
    IO.inspect(reason)
  end
end
