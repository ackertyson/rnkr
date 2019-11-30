defmodule RnkrInterface.Score do
  use Ecto.Schema
  import Ecto.Changeset

  schema "scores" do
    field :contestant, :string
    field :username, :string
    field :value, :integer
    field :contest_id, :id

    timestamps()
  end

  @doc false
  def changeset(score, attrs) do
    score
    |> cast(attrs, [:contestant, :username, :value])
    |> validate_required([:contestant, :username, :value])
  end
end
