import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setToken } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Message, Header } from "semantic-ui-react";
import apiService from "../context/apiService";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiService.post("login/", {
        user_id: userId,
        password: password,
      });
      const { access, refresh } = response.data;

      // Save tokens to sessionStorage
      sessionStorage.setItem("accessToken", access);
      sessionStorage.setItem("refreshToken", refresh);

      // Update Redux state
      dispatch(setToken(access));

      // Navigate to the home page
      navigate("/");
    } catch {
      setErrorMessage("登入失敗，請確認帳號和密碼是否正確");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header as="h1" textAlign="center">
        玉峰國小校務系統
      </Header>
      <Form
        loading={isLoading}
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <Form.Input
          className="login-input"
          label="學號/教職人員編號"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="請輸入學號/教職人員編號"
          required
        />
        <Form.Input
          className="login-input"
          label="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="請輸入密碼"
          type="password"
          required
        />
        {errorMessage && <Message negative>{errorMessage}</Message>}
        <Button type="submit" color="teal" fluid>
          登入
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
