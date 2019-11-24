defmodule Rnkr.Voter do
  use GenStateMachine, callback_mode: :state_functions

  alias __MODULE__
  alias Rnkr.Contest

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
    [a | [b | _]] = contestant_names

    {:ok, :voting,
     %{
       voter: voter,
       contestants: [a, b],
       contest_name: contest_name,
       previous_contestants: []
     }}
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

  def via_tuple(name), do: {:via, Registry, {Registry.Rnkr, "voter:" <> name}}

  ### PRIVATE METHODS

  defp record_vote(
         from,
         winner,
         %{
           voter: %Voter{votes: votes} = voter,
           contestants: contestants,
           previous_contestants: previous_names
         } = data
       )
       when length(contestants) > 1 do
    [loser | _] = Enum.filter(contestants, fn name -> name != winner end)

    # increase votes for WINNER, ensure LOSER has an entry in VOTES
    new_votes = %{votes | winner => votes[winner] + votes[loser] + 1}

    new_voter = %Voter{voter | votes: new_votes}

    {:next_state, :fetching,
     %{
       data
       | voter: new_voter,
         contestants: [winner],
         previous_contestants: [winner | [loser | previous_names]]
     }, [{:reply, from, :ok}]}
  end

  defp record_vote(from, _, data) do
    {:next_state, :report_scores, data, [{:reply, from, :ok}]}
  end

  ### EVENT CALLBACKS

  def voting(
        {:call, from},
        {:vote, payload},
        data
      ) do
    record_vote(from, payload, data)
  end

  def voting(
        {:call, from},
        :get_contestants,
        %{contestants: contestants}
      ) do
    # return currently stored contestants
    {:keep_state_and_data, [{:reply, from, {:ok, contestants}}]}
  end

  def voting(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def fetching(
        {:call, from},
        :get_contestants,
        %{
          contest_name: contest_name,
          contestants: contestants,
          previous_contestants: previous_names
        } = data
      ) do
    # get new calculated contestant(s) from CONTEST
    case Contest.get_next_contestant(Contest.via_tuple(contest_name), previous_names) do
      {:ok, next_contestant} ->
        new_contestants = [next_contestant | contestants]

        {:next_state, :voting, %{data | contestants: new_contestants},
         [{:reply, from, {:ok, new_contestants}}]}

      :done ->
        {:next_state, :report_scores, data, [{:reply, from, :done}]}
    end
  end

  def fetching({:call, from}, {:vote, _}, _) do
    {:keep_state_and_data,
     [{:reply, from, {:error, {:reason, "Not in voting state; do 'get_contestants'"}}}]}
  end

  def fetching(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def report_scores({:call, from}, :get_scores, %{votes: votes} = data) do
    {:next_state, :done, data, [{:reply, from, {:ok, votes}}]}
  end

  def report_scores(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  def done(event_type, event_content, data) do
    handle_event(event_type, event_content, data)
  end

  ## VOTE outside of VOTING state

  def handle_event({:call, from}, {:vote, _}, _) do
    {:keep_state_and_data, [{:reply, from, {:error, {:reason, "Voting is closed"}}}]}
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
