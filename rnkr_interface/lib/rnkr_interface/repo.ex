defmodule RnkrInterface.Repo do
  use Ecto.Repo,
    otp_app: :rnkr_interface,
    adapter: Ecto.Adapters.Postgres
end
