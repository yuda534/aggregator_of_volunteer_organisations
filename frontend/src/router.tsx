import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Organizations from "@/pages/Organizations";
import Volunteers from "@/pages/Volunteers";
import Map from "@/pages/Map";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import CreateEvent from "@/pages/CreateEvent";
import Initiatives from "@/pages/Initiatives";
import MyApplications from "@/pages/MyApplications";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/events", element: <Events /> },
  { path: "/events/:id", element: <EventDetail /> },
  { path: "/events/create", element: <CreateEvent /> },
  { path: "/organizations", element: <Organizations /> },
  { path: "/volunteers", element: <Volunteers /> },
  { path: "/map", element: <Map /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/profile/:id", element: <Profile /> },
  { path: "/initiatives", element: <Initiatives /> },
  { path: "/my-applications", element: <MyApplications /> },
]);