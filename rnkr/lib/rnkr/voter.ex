defmodule Rnkr.Voter do
  use GenStateMachine, callback_mode: :state_functions

  alias __MODULE__

  @enforce_keys [:name, :votes]
  defstruct [:name, :votes]

  @type t :: %__MODULE__{name: String.t(), votes: %{String.t() => integer()}}

  @timeout 150_000

  @spec start_link(String.t(), String.t(), nonempty_list(String.t())) ::
          :ignore | {:error, any} | {:ok, pid}
  def start_link(contest_name, username, contestant_names) do
    GenStateMachine.start_link(
      __MODULE__,
      {contest_name, username, contestant_names},
      name: via_tuple(username),
      timeout: @timeout
    )
  end

  def init({contest_name, username, contestant_names}) do
    votes = Enum.reduce(contestant_names, %{}, fn name, acc -> Map.put(acc, name, 0) end)
    {:ok, voter} = Voter.new(username, votes)

    {:ok, :updating_ballot,
     %{
       voter: voter,
       contestants: contestant_names,
       contest_name: contest_name,
       ballot: []
     }}
  end

  def terminate(:shutdown, _state, %{voter: %Voter{name: name}, contest_name: contest}) do
    IO.puts("Shutting down process for voter '#{name}' in contest '#{contest}'...")
  end

  ### PUBLIC INTERFACE

  @spec new(String.t(), %{String.t() => integer()}) :: {:ok, Rnkr.Voter.t()}
  def new(name, votes) do
    {:ok, %Voter{name: name, votes: votes}}
  end

  def cast_vote(pid, data) do
    GenStateMachine.call(pid, {:vote, data})
  end

  def get_contestants(pid) do
    GenStateMachine.call(pid, :get_contestants)
  end

  def get_scores(pid) do
    GenStateMachine.call(pid, :get_scores)
  end

  def close(pid, reason) do
    GenStateMachine.stop(pid, reason)
  end

  def via_tuple(name), do: {:via, Registry, {Registry.Rnkr, "voter:" <> name}}

  ### PRIVATE METHODS

  defp fill_ballot(ballot, contestants) when length(ballot) == 2 do
    {ballot, contestants}
  end

  defp fill_ballot(ballot, contestants) when length(contestants) > 0 do
    [a | remaining_contestants] = contestants
    new_ballot = [a | ballot]
    fill_ballot(new_ballot, remaining_contestants)
  end

  defp fill_ballot(ballot, _) do
    {ballot, []}
  end

  ### EVENT CALLBACKS

  def updating_ballot(
        {:call, from},
        :get_contestants,
        %{contestants: contestants} = data
      )
      when length(contestants) == 0 do
    {:next_state, :reporting_scores, data, [{:reply, from, :done}]}
  end

  def updating_ballot(
        {:call, from},
        :get_contestants,
        %{
          contestants: contestants,
          ballot: ballot
        } = data
      ) do
    {next_ballot, remaining_contestants} = fill_ballot(ballot, contestants)

    {:next_state, :voting,
     %{data | contestants: remaining_contestants, ballot: next_ballot},
     [{:reply, from, {:ok, next_ballot}}]}
  end

  def updating_ballot({:call, from}, {:vote, _}, _) do
    {:keep_state_and_data,
     [{:reply, from, {:error, {:reason, "Not in voting state; do 'get_contestants'"}}}]}
  end

  def updating_ballot(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def voting(
        {:call, from},
        {:vote, winner},
        %{
          voter: %Voter{votes: votes} = voter,
          ballot: ballot
        } = data
      ) do
    case Enum.member?(ballot, winner) do
      true ->
        [loser | _] =
          Enum.filter(ballot, fn contestant ->
            contestant != winner
          end)

        new_votes = %{votes | winner => votes[winner] + votes[loser] + 1}
        new_voter = %Voter{voter | votes: new_votes}

        {:next_state, :updating_ballot, %{data | voter: new_voter, ballot: [winner]},
         [{:reply, from, :ok}]}

      _ ->
        {:keep_state_and_data, [{:reply, from, {:error, {:reason, "Invalid contestant"}}}]}
    end
  end

  def voting({:call, from}, :get_contestants, _) do
    {:keep_state_and_data,
     [{:reply, from, {:error, {:reason, "In voting state; do 'cast_vote'"}}}]}
  end

  def voting(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def reporting_scores({:call, from}, :get_scores, %{voter: %{votes: votes}} = data) do
    {:next_state, :done, data, [{:reply, from, {:ok, votes}}]}
  end

  def reporting_scores(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def done({:call, from}, _, _) do
    {:keep_state_and_data, [{:reply, from, {:error, {:reason, "Voting is closed"}}}]}
  end

  def done(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  ## CATCH-ALLS

  def handle_event(:cast, _, _) do
    :keep_state_and_data
  end

  def handle_event({:call, from}, _, _) do
    {:keep_state_and_data, [{:reply, from, {:error, {:reason, "Unknown voter command"}}}]}
  end

  def handle_info(:timeout, data) do
    {:stop, {:shutdown, :timeout}, data}
  end
end
