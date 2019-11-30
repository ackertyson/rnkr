defmodule Rnkr.Contestant do
  alias __MODULE__

  @enforce_keys [:name]
  defstruct [:name, :score, :votes]

  @type t :: %__MODULE__{
          name: String.t(),
          score: integer(),
          votes: list(integer)
        }

  @spec new(String.t()) :: {:ok, Rnkr.Contestant.t()}
  def new(name) do
    {:ok, %Contestant{name: name, score: 0, votes: []}}
  end

  @spec put_vote(Rnkr.Contestant.t(), integer()) :: {:ok, Rnkr.Contestant.t()}
  def put_vote(%Contestant{votes: votes} = contestant, weight \\ 1) do
    {:ok, contestant} = with_updated_score(%Contestant{contestant | votes: [weight | votes]})
    {:ok, contestant}
  end

  @spec with_updated_score(Rnkr.Contestant.t()) :: {:ok, Rnkr.Contestant.t()}
  defp with_updated_score(%Contestant{votes: votes} = contestant) do
    score = Enum.reduce(votes, fn val, acc -> acc + val end)
    {:ok, %Contestant{contestant | score: score}}
  end
end
