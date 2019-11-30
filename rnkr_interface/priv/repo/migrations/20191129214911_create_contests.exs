defmodule RnkrInterface.Repo.Migrations.CreateContests do
  use Ecto.Migration

  def change do
    create table(:contests) do
      add :name, :string

      timestamps()
    end

    create unique_index(:contests, [:name])
  end
end
