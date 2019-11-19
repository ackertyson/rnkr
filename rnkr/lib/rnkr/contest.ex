defmodule Rnkr.Contest do
  use GenStateMachine, callback_mode: :state_functions

  alias Rnkr.{Contest, Contestant}

  @enforce_keys [:name, :contestants]
  defstruct [:name, :contestants]

  @type t :: %__MODULE__{name: String.t(), contestants: %{String.t() => Contestant.t()}}

  @timeout 150_000

  def start_link(name, contestant_names) do
    contestants =
      Enum.reduce(contestant_names, %{}, fn contestant_name, acc ->
        Map.put(acc, contestant_name, %Contestant{name: contestant_name, score: 0})
      end)

    GenStateMachine.start_link(
      __MODULE__,
      {name, contestants},
      name: via_tuple(name),
      timeout: @timeout
    )
  end

  def init({name, contestants}) do
    {:ok, :preparing, %{contest: %Contest{name: name, contestants: contestants}, voters: []}}
  end

  ### PUBLIC INTERFACE

  def open_voting(pid) do
    GenStateMachine.cast(pid, :begin)
  end

  def get_contestants(pid) do
    GenStateMachine.call(pid, :get_contestants)
  end

  def join(pid) do
    GenStateMachine.call(pid, :join)
  end

  def cast_vote(pid, data) do
    GenStateMachine.call(pid, {:vote, data})
  end

  def get_scores(pid) do
    GenStateMachine.call(pid, :get_scores)
  end

  def close_voting(pid) do
    GenStateMachine.cast(pid, :end)
  end

  ### PRIVATE METHODS

  def calculate_scores(contestants) do
    for {name, %Contestant{score: score}} <- Map.to_list(contestants),
        do: %{name => score}
  end

  def via_tuple(name), do: {:via, Registry, {Registry.Rnkr, name}}

  ### EVENT CALLBACKS

  def preparing(:cast, :begin, data) do
    {:next_state, :voting, data}
  end

  def preparing(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def voting({:call, {pid, _} = from}, :join, %{voters: voters} = data) do
    if Enum.member?(voters, pid) do
      {:keep_state_and_data, [{:reply, from, voters}]}
    else
      new_data = %{data | voters: [pid | voters]}
      {:keep_state, new_data, [{:reply, from, :ok}]}
    end
  end

  def voting(
        {:call, {pid, _} = from},
        {:vote, contestant_name},
        %{
          contest: %{contestants: contestants} = contest,
          voters: voters
        } = data
      ) do
    if Enum.member?(voters, pid) do
      if Map.has_key?(contestants, contestant_name) do
        contestant = contestants[contestant_name]

        new_contestants = %{
          contestants
          | contestant_name => Contestant.add_score(contestant)
        }

        new_contest = %{contest | contestants: new_contestants}
        {:keep_state, %{data | contest: new_contest}, [{:reply, from, :ok}]}
      else
        {:keep_state, data, [{:reply, from, :ok}]}
      end
    else
      {:keep_state_and_data,
       [{:reply, from, {:error, {:reason, "You must join the event before voting"}}}]}
    end
  end

  def voting(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def done(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  ## JOIN outside of VOTING state
  def handle_event({:call, from}, :join, _) do
    {:keep_state_and_data,
     [{:reply, from, {:error, {:reason, "Contest not found or is closed"}}}]}
  end

  ## VOTE outside of VOTING state

  def handle_event(
        {:call, from},
        {:vote, _},
        _
      ) do
    {:keep_state_and_data, [{:reply, from, {:error, {:reason, "Voting is closed"}}}]}
  end

  ## events valid in ANY state

  def handle_event(
        {:call, from},
        :get_scores,
        %{contest: %{contestants: contestants}}
      ) do
    {:keep_state_and_data, [{:reply, from, calculate_scores(contestants)}]}
  end

  def handle_event(
        {:call, from},
        :get_contestants,
        %{contest: %{contestants: contestants}}
      ) do
    contestant_names = for %Contestant{name: name} <- Map.values(contestants), do: name
    {:keep_state_and_data, [{:reply, from, contestant_names}]}
  end

  def handle_event(:cast, :end, data) do
    {:next_state, :done, data}
  end

  ## CATCH-ALLS

  def handle_event(:cast, _, _) do
    :keep_state_and_data
  end

  def handle_event({:call, from}, _, _) do
    {:keep_state_and_data, [{:reply, from, {:error, {:reason, "unknown command"}}}]}
  end

  def handle_info(:timeout, data) do
    {:stop, {:shutdown, :timeout}, data}
  end
end
