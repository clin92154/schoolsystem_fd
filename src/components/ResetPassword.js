import React, { useState } from "react";
import {
  Form,
  Button,
  Message,
  Container,
  Header,
  Segment,
} from "semantic-ui-react";
import apiService from "../context/apiService";
function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const ResetPassword = async (newPassword) => {
    setIsLoading(true);
    try {
      await apiService.post(
        "reset/password/",
        {
          new_password: newPassword,
        },
        sessionStorage.getItem("accessToken")
      );
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      // Navigate to the main page or dashboard
    } catch (error) {
      console.log(error.response.data);
      setError(error.response.data.detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("密碼不一致");
      return;
    }
    ResetPassword(newPassword);
  };

  return (
    <Container>
      <Segment>
        <Header as="h2" color="teal" textAlign="center">
          更新密碼
        </Header>
        <Form
          onSubmit={handleSubmit}
          error={!!error}
          success={success}
          loading={isLoading}
        >
          <Form.Input
            fluid
            icon="lock"
            iconPosition="left"
            label="新密碼"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Form.Input
            fluid
            icon="lock"
            iconPosition="left"
            label="確認新密碼"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Message
            error
            list={error.length > 1 && error}
            content={error.length < 2 && error}
          />
          <Message success content="密碼修改成功！" />
          <Button color="teal" fluid size="medium" type="submit">
            提交
          </Button>
        </Form>
      </Segment>
    </Container>
  );
}

export default ResetPassword;
