import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Organizations from "@/pages/Organizations";
import Volunteers from "@/pages/Volunteers";
import Map from "@/pages/Map";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/events", element: <Events /> },
  { path: "/events/:id", element: <EventDetail /> },
  { path: "/organizations", element: <Organizations /> },
  { path: "/volunteers", element: <Volunteers /> },
  { path: "/map", element: <Map /> },
]);
