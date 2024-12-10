import apiService from "../context/apiService";
import DatePicker from "react-semantic-ui-datepickers";
import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Select,
  Segment,
  Header,
  Container,
} from "semantic-ui-react";

const Profile = ({ token }) => {
  const [profile, setProfile] = useState("");
  const [LastName, setLastName] = useState("");
  const [FirstName, setFirstName] = useState("");
  const [EngName, setEngName] = useState("");
  const [Gender, setGender] = useState("");
  const [Birth, setBirth] = useState(null);

  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");

  const options = [
    { key: "m", text: "Male", value: "male" },
    { key: "f", text: "Female", value: "female" },
  ];
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleSubmitGuardian = async () => {
    try {
      // 監護人資料
      const guardianData = {
        name: guardianName,
        phone_number: guardianPhone,
        relationship: guardianRelationship,
        address: guardianAddress,
      };

      // 提交監護人資料
      const guardianResponse = await apiService.post(
        "guardian/",
        guardianData,
        token
      );

      if (guardianResponse.status === 201 || guardianResponse.status === 200) {
        alert("監護人資料已成功提交!");
      }
    } catch (error) {
      alert("更新監護人資料時發生錯誤:", error);
    }
  };

  const handleSubmitProfile = async () => {
    try {
      const requestData = {
        first_name: FirstName,
        last_name: LastName,
        eng_name: EngName,
        gender: Gender,
        birthday: Birth,
      };

      const response = await apiService.put("profile/", requestData, token);
      if (response.status === 200) {
        alert("個人資料更新成功！");
        fetchUserProfile();
      }
    } catch (error) {
      console.error("更新個人資料時發生錯誤:", error);
      alert("更新失敗，請稍後再試");
    }
  };

  // 將 fetchUserProfile 移到組件內部作為函數
  const fetchUserProfile = async () => {
    try {
      const response = await apiService.get("profile/", {}, token);
      setProfile(response.data);
      setFirstName(response.data.first_name);
      setLastName(response.data.last_name);
      setBirth(response.data.birthday);
      setGender(response.data.gender);
      setEngName(response.data.eng_name);
    } catch (error) {
      console.error("獲取個人資料時發生錯誤:", error);
    }
  };

  const fetchGuardian = async () => {
    try {
      const response = await apiService.get("guardian/", {}, token);
      console.log(response.data);
      setGuardianName(response.data.name);
      setGuardianPhone(response.data.phone_number);
      setGuardianAddress(response.data.address);
      setGuardianRelationship(response.data.relationship);
    } catch (error) {
      console.error("獲取監護人資料時發生錯誤:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // 添加 token 作為依賴

  useEffect(() => {
    if (profile.role === "student") {
      fetchGuardian();
    }
  }, [profile]); // 添加 token 作為依賴

  return (
    <Container>
      <Segment>
        <Header as="h1">個人檔案</Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitProfile();
          }}
        >
          <Form.Group widths="equal">
            <Form.Field
              label="姓"
              control="input"
              value={FirstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Form.Field
              label="名"
              control="input"
              value={LastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field
              label="英文名"
              control="input"
              value={EngName}
              onChange={(e) => setEngName(e.target.value)}
            />
            <Form.Field
              label={profile && profile.role ? "學號" : "職員編號"}
              control="input"
              value={profile && profile.user_id}
              disabled
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field>
              <DatePicker
                label="出生日期"
                control="input"
                value={profile ? new Date(Birth) : Birth}
                onChange={(event, data) => {
                  setBirth(formatDate(data.value));
                }}
              />
            </Form.Field>
            <Form.Field
              label="身分"
              control="input"
              value={profile && profile.role}
              disabled
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field
              control={Select}
              options={options}
              label={"性別"}
              placeholder="Gender"
              value={Gender}
              onChange={(e, { value }) => setGender(value)}
            />
            <Form.Field
              label="班級"
              control="input"
              value={profile && profile.class_name}
              disabled
            />
          </Form.Group>
        </Form>
        <div style={{ marginTop: "1em" }}>
          <Button
            content="更新檔案"
            floated="right"
            primary
            onClick={handleSubmitProfile}
          />
          <div style={{ clear: "both" }}></div>
        </div>
      </Segment>
      {profile && profile.role === "student" && (
        <Segment>
          <Header as="h1">監護人資料</Header>
          <Form onSubmit={handleSubmitGuardian}>
            <Form.Group widths="equal">
              <Form.Field
                required
                label="監護人名字"
                control="input"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
              <Form.Field
                required
                label="監護人電話"
                control="input"
                value={guardianPhone}
                onChange={(e) => {
                  setGuardianPhone(e.target.value);
                }}
              />
              <Form.Field
                required
                label="監護人關係"
                control="input"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
              />
            </Form.Group>
            <Form.Field
              required
              label="地址"
              control="textarea"
              value={guardianAddress}
              onChange={(e) => setGuardianAddress(e.target.value)}
            />
            <div style={{ marginTop: "1em" }}>
              <Button content="更新監護人資料" floated="right" primary />
              <div style={{ clear: "both" }}></div>
            </div>
          </Form>
        </Segment>
      )}
    </Container>
  );
};

export default Profile;
