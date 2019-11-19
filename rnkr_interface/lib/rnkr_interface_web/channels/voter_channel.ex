defmodule RnkrInterfaceWeb.VoterChannel do
  use RnkrInterfaceWeb, :channel

  alias Rnkr.Contest

  alias RnkrInterfaceWeb.Presence

  def join(channel, %{"username" => username}, socket) do
    [_, type, name] = String.split(channel, ":")
    send(self(), {:after_join, {username, type, name}})
    {:ok, socket}
  end

  def handle_in("add_score", %{"name" => contestant_name}, socket) do
    "contest:" <> name = socket.topic

    case Contest.cast_vote(via(name), contestant_name) do
      {:ok, score} ->
        broadcast!(socket, "score_change", score)
        {:reply, :ok, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: inspect(reason)}}, socket}
    end
  end

  def handle_in("add_score", _payload, socket) do
    {:reply, {:error, %{reason: "422 Unprocessable Entity"}}, socket}
  end

  def handle_in("get_scores", _payload, socket) do
    [_, _, name] = String.split(socket.topic, ":")
    score = Contest.get_scores(via(name))
    {:reply, {:ok, %{score: score}}, socket}
  end

  def handle_in("get_contestants", _payload, socket) do
    broadcast!(socket, "contestants", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_info({:after_join, {username, type, name}}, socket) do
    {:ok, _} =
      Presence.track(socket, "consumer:" <> username <> type <> name, %{
        online_at: inspect(System.system_time(:second))
      })

    {:noreply, socket}
  end

  defp via(name), do: Contest.via_tuple(name)
end
