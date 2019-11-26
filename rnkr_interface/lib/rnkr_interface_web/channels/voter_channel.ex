defmodule RnkrInterfaceWeb.VoterChannel do
  use RnkrInterfaceWeb, :channel

  alias Rnkr.{Contest, Voter}
  alias RnkrInterfaceWeb.Presence

  def join(channel, %{"username" => username}, socket) do
    [_, type, contest_name] = String.split(channel, ":")
    send(self(), {:after_join, {username, type, contest_name}})
    {:ok, socket}
  end

  defp request_score_fetch(name, socket) do
    Contest.request_score_fetch(via_contest(name), via(socket.assigns.username))

    push(socket, "voting_complete", %{})

    RnkrInterfaceWeb.Endpoint.broadcast_from(
      self(),
      "contest:moderator:" <> name,
      "score_change",
      %{}
    )
  end

  def handle_in("cast_vote", %{"name" => contestant_name}, socket) do
    "contest:voter:" <> name = socket.topic

    case Voter.cast_vote(via(socket.assigns.username), contestant_name) do
      :ok ->
        RnkrInterfaceWeb.Endpoint.broadcast_from(
          self(),
          "contest:moderator:" <> name,
          "score_change",
          %{}
        )

        {:reply, :ok, socket}

      :done ->
        request_score_fetch(name, socket)
        {:reply, :done, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: inspect(reason)}}, socket}
    end
  end

  def handle_in("cast_vote", _payload, socket) do
    {:reply, {:error, %{reason: "400 Bad Request"}}, socket}
  end

  def handle_in("get_contestants", _payload, socket) do
    case Voter.get_contestants(via(socket.assigns.username)) do
      {:ok, contestant_names} ->
        names_hash =
          Enum.reduce(contestant_names, %{}, fn name, acc ->
            Map.put(acc, name, name)
          end)

        {:reply, {:ok, names_hash}, socket}

      :done ->
        "contest:voter:" <> name = socket.topic
        request_score_fetch(name, socket)
        {:reply, :done, socket}
    end
  end

  def handle_in("get_scores", _payload, socket) do
    "contest:voter:" <> name = socket.topic
    {:ok, scores} = Contest.get_scores(via_contest(name))
    {:reply, {:ok, scores}, socket}
  end

  def handle_info({:after_join, {username, type, contest_name}}, socket) do
    {:ok, _} =
      Presence.track(socket, type <> username <> contest_name, %{
        online_at: inspect(System.system_time(:second))
      })

    Contest.join(via_contest(contest_name), username)
    {:noreply, assign(socket, :username, username)}
  end

  defp via(name), do: Voter.via_tuple(name)
  defp via_contest(name), do: Contest.via_tuple(name)
end
