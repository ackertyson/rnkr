defmodule RnkrInterfaceWeb.ModeratorChannel do
  use RnkrInterfaceWeb, :channel

  alias Rnkr.Contest
  alias RnkrInterfaceWeb.Presence

  def join(channel, %{"username" => username}, socket) do
    [_, type, name] = String.split(channel, ":")
    send(self(), {:after_join, {username, type, name}})
    {:ok, socket}
  end

  def handle_in("create", %{"name" => name, "contestants" => contestant_names}, socket) do
    case Contest.start_link(name, contestant_names) do
      {:ok, _} ->
        :ok = Contest.open_voting(via(name))
        {:reply, :ok, socket}

      {:error, {:already_started, _pid}} ->
        {:reply, :ok, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: inspect(reason)}}, socket}
    end
  end

  def handle_in("create", _payload, socket) do
    {:reply, {:error, %{reason: "422 Unprocessable Entity"}}, socket}
  end

  def handle_in("get_scores", _payload, socket) do
    "contest:moderator:" <> name = socket.topic
    {:ok, scores} = Contest.get_scores(via(name))
    {:reply, {:ok, scores}, socket}
  end

  def handle_info({:after_join, {username, type, name}}, socket) do
    {:ok, _} =
      Presence.track(socket, username <> ":" <> type <> ":" <> name, %{
        online_at: inspect(System.system_time(:second))
      })

    {:noreply, socket}
  end

  defp via(name), do: Contest.via_tuple(name)
end
