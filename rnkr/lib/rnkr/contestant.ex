defmodule Rnkr.Contestant do
  alias __MODULE__

  @enforce_keys [:name]
  defstruct [:name, :score]

  @type t :: %__MODULE__{name: String.t(), score: integer()}

  def new(name) do
    {:ok, %Contestant{name: name, score: 0}}
  end

  def add_score(%Contestant{score: score} = contestant, amount \\ 1) do
    %Contestant{contestant | score: score + amount}
  end
end
