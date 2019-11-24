defmodule Rnkr.Contestant do
  alias __MODULE__

  @enforce_keys [:name]
  defstruct [:name, :score, :votes]

  @type t :: %__MODULE__{
          name: String.t(),
          score: integer(),
          votes: %{required(pid()) => integer()}
        }

  @spec new(String.t()) :: {:ok, Rnkr.Contestant.t()}
  def new(name) do
    {:ok, %Contestant{name: name, score: 0, votes: %{}}}
  end

  @spec put_vote(Rnkr.Contestant.t(), pid(), integer()) :: {:ok, Rnkr.Contestant.t()}
  def put_vote(%Contestant{votes: votes} = contestant, voter_id, weight \\ 1) do
    new_votes = Map.put(votes, voter_id, weight)
    {:ok, contestant} = with_updated_score(%Contestant{contestant | votes: new_votes})
    {:ok, contestant}
  end

  @spec with_updated_score(Rnkr.Contestant.t()) :: {:ok, Rnkr.Contestant.t()}
  defp with_updated_score(%Contestant{votes: votes} = contestant) do
    score = Enum.reduce(Map.values(votes), fn val, acc -> acc + val end)
    {:ok, %Contestant{contestant | score: score}}
  end
end
