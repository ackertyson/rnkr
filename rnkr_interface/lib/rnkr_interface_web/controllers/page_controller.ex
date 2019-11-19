defmodule RnkrInterfaceWeb.PageController do
  use RnkrInterfaceWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
