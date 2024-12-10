import Header from "./Header";
import "semantic-ui-css/semantic.min.css";
import {
  Container,
  Grid,
  GridColumn,
  Segment,
  GridRow,
} from "semantic-ui-react";
import { BrowserRouter, Routes, Outlet, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import Login from "./components/Login";
import "./style/Login.css";
import Nav from "./Nav";
import ResetPassword from "./components/ResetPassword";
import LeaveApplication from "./components/LeaveApplication";
import LeaveApproval from "./components/LeaveApproval";
import Profile from "./components/Profile";
import CourseManage from "./components/CourseManage";
import ScoreRegister from "./components/ScoreRegister";
import StudentProfile from "./components/StudentProfile";
import ScoreHistory from "./components/ScoreHistory";
import Score from "./components/Score";
import CourseSchedule from "./components/CourseSchedule";
const MainViewLayout = () => {
  return (
    <Container>
      <Grid>
        <GridRow>
          <GridColumn width={3}>
            <Nav />{" "}
          </GridColumn>
          <GridColumn width={13}>
            <Outlet />
          </GridColumn>
          <GridColumn width={3}></GridColumn>
        </GridRow>
      </Grid>
    </Container>
  );
};

const LoginLayout = () => {
  return (
    <Container fluid className="login-layout-container">
      {" "}
      <Grid centered>
        <Grid.Row>
          <Grid.Column width={5} className="login-layout-column">
            <Outlet />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};
const NotFound = () => {
  return (
    <Container>
      <Segment textAlign="center" padded="very">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </Segment>
    </Container>
  );
};
function App() {
  // const [profile, setProfile] = useState("");
  const accessToken = sessionStorage.getItem("accessToken");
  const profile = useSelector((state) => state.auth.profile);
  console.log(profile);

  return (
    <BrowserRouter>
      <Header profile={profile} />
      <Routes>
        <Route element={<LoginLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/" element={<MainViewLayout />}></Route>
        <Route path="/setting" element={<MainViewLayout />}>
          <Route path="profile" element={<Profile token={accessToken} />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            path="course/manage"
            element={<CourseManage token={accessToken} />}
          />
        </Route>
        <Route path="/search" element={<MainViewLayout />}>
          <Route
            path="score/history"
            element={<ScoreHistory token={accessToken} />}
          />
          <Route path="score" element={<Score token={accessToken} />} />
          <Route
            path="teacher/schedule"
            element={<CourseSchedule token={accessToken} />}
          />
          <Route
            path="schedule"
            element={<CourseSchedule token={accessToken} />}
          />
          <Route
            path="profile/students"
            element={<StudentProfile token={accessToken} />}
          />
          <Route
            path="leaving/status/"
            element={<LeaveApproval token={accessToken} profile={profile} />}
          />
          <Route
            path="leaving/approving/"
            element={<LeaveApproval token={accessToken} profile={profile} />}
          />
        </Route>
        <Route path="/apply" element={<MainViewLayout />}>
          <Route
            path="leaving"
            element={<LeaveApplication token={accessToken} profile={profile} />}
          />
        </Route>
        <Route path="/register" element={<MainViewLayout />}>
          <Route path="score" element={<ScoreRegister token={accessToken} />} />
          <Route path="leaving" element={<LeaveApplication />} />
        </Route>
        <Route path="*" element={<MainViewLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
