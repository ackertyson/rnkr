defmodule RnkrInterfaceWeb.Presence do
  use Phoenix.Presence, otp_app: :rnkr_interface, pubsub_server: RnkrInterface.PubSub
end
