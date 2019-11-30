defmodule RnkrInterface.Repo.Migrations.CreateScores do
  use Ecto.Migration

  def change do
    create table(:scores) do
      add :contestant, :string
      add :username, :string
      add :value, :integer
      add :contest_id, references(:contest, on_delete: :nothing)

      timestamps()
    end

    create index(:scores, [:contest_id])
  end
end
