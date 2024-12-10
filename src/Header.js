import React, { useState, useEffect } from "react";
import { Menu } from "semantic-ui-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setProfile } from "./features/auth/authSlice";
import apiService from "./context/apiService";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const accessToken = sessionStorage.getItem("accessToken");
  const token = useSelector((state) => state.auth.token);
  const profile = useSelector((state) => state.auth.profile);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiService.get("user-info/", {}, accessToken);
        dispatch(setProfile(response.data));
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [token, dispatch]);
  const handleLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiService.post("logout/", { refresh: refreshToken }, token);
      }
    } catch (error) {
      console.error("登出失敗：", error);
    } finally {
      dispatch(logout());
      sessionStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  return (
    <Menu>
      <Menu.Item as={Link} to="/">
        玉峰國小
      </Menu.Item>
      <Menu.Menu position="right">
        {token ? (
          <>
            <Menu.Item>{profile?.name}</Menu.Item>
            <Menu.Item onClick={handleLogout}>登出</Menu.Item>
          </>
        ) : (
          <Menu.Item as={Link} to="/login">
            登入
          </Menu.Item>
        )}
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
