import React, { useState, useEffect } from "react";
import {
  Container,
  Header,
  List,
  Segment,
  Grid,
  Label,
  Message,
  Button,
  Form,
  TextArea,
} from "semantic-ui-react";
import "../style/LeaveSearch.css";
import apiService from "../context/apiService";
import { useSelector } from "react-redux";

function LeaveApproval({ token }) {
  const [leavinglist, setLeavingList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [results, setResults] = useState(null);
  const [flag, setFlag] = useState(false);
  const profile = useSelector((state) => state.auth.profile);
  const handleApprove = async () => {
    try {
      const response = await apiService.post(
        `leave-approval/${selectedRequest.leave_id}`,
        { status: status, remark: remarks },
        token
      );
      if (response.status === 200) {
        setFlag(true);
      }
      setResults({
        status: response.status,
        message: response.data.message,
      });
    } catch (error) {
      setResults({
        status: error.status,
        message: error.message,
      });
      setRemarks("");
      console.error("獲取請假記錄失敗:", results);
    }
  };

  const fetchLeavingDetail = async (leave_id) => {
    try {
      setRemarks("");

      const response = await apiService.get(
        `leaving-detail/${leave_id}/`,
        {},
        token
      );
      if (response.data.status) {
        setStatus(response.data.status);
        setRemarks(response.data.remark);
      }
      setSelectedRequest(response.data);
    } catch (error) {
      console.error("獲取請假詳細資訊失敗:", error);
    }
  };

  const handleRequestClick = (leave_id) => {
    fetchLeavingDetail(leave_id);
    setResults(null);
  };

  const formatLeavePeriods = (periods) => {
    return periods && periods.length > 0 ? periods.join(", ") : "無";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "yellow";
    }
  };

  const renderLeaveList = () => {
    return (
      <List divided relaxed>
        {leavinglist.map((request) => (
          <List.Item
            key={request.leave_id}
            onClick={() => handleRequestClick(request.leave_id)}
            className="leave-list-item"
          >
            <List.Content>
              <List.Header>{request.leave_id}</List.Header>
              <List.Description>
                類型: {request.leave_type} | 日期: {request.start_datetime} -{" "}
                {request.end_datetime}
              </List.Description>
              <Label color={getStatusColor(request.status)} horizontal>
                {request.status}
              </Label>
            </List.Content>
          </List.Item>
        ))}
      </List>
    );
  };

  const renderLeaveDetails = () => {
    if (!selectedRequest) return null;

    return (
      <Container>
        <Segment>
          <Header as="h3">請假詳細資訊</Header>
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column>
                <p>
                  <strong>請假單號:</strong> {selectedRequest.leave_id}
                </p>
                <p>
                  <strong>學生:</strong> {selectedRequest.student}
                </p>
                <p>
                  <strong>請假類型:</strong> {selectedRequest.leave_type}
                </p>
                <p>
                  <strong>請假節次:</strong>{" "}
                  {"第" + selectedRequest.periods.join(",") + "節"}
                </p>
              </Grid.Column>
              <Grid.Column>
                <p>
                  <strong>申請日期:</strong> {selectedRequest.apply_date}
                </p>
                <p>
                  <strong>開始時間:</strong> {selectedRequest.start_datetime}
                </p>
                <p>
                  <strong>結束時間:</strong> {selectedRequest.end_datetime}
                </p>
                <p>
                  <strong>原因:</strong> {selectedRequest.reason}
                </p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        <Segment>
          <Header as="h3">
            審核結果
            <Label color={getStatusColor(selectedRequest.status)} horizontal>
              {selectedRequest.status}
            </Label>
          </Header>
          {renderApprovalForm(selectedRequest)}
        </Segment>
      </Container>
    );
  };

  const renderApprovalForm = (selectedRequest) => {
    if (!selectedRequest) return null;

    return (
      <Form
        onSubmit={handleApprove}
        success={results && results.status === 200}
        error={results && results.status !== 200}
      >
        <Form.Field>
          <Grid columns={2}>
            <Grid.Column>
              {selectedRequest.approved_by && (
                <p>
                  <strong>審核人:</strong> {selectedRequest.approved_by}
                </p>
              )}
              {selectedRequest.approved_date && (
                <p>
                  <strong>審核日期:</strong> {selectedRequest.approved_date}
                </p>
              )}
            </Grid.Column>

            <Grid.Column>
              <Form.Field>
                <p>
                  <strong>備註:</strong>
                </p>
                {profile?.role === "teacher" ? (
                  <TextArea
                    style={{ resize: "none" }}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="請輸入備註"
                  />
                ) : (
                  remarks
                )}
              </Form.Field>
            </Grid.Column>
          </Grid>
        </Form.Field>

        {profile?.role === "teacher" && (
          <Button.Group>
            <Button
              type="button"
              onClick={() => setStatus("approved")}
              positive={status === "approved"}
              basic={status !== "approved"}
            >
              核准
            </Button>
            <Button.Or text="或" />
            <Button
              type="button"
              onClick={() => setStatus("rejected")}
              negative={status === "rejected"}
              basic={status !== "rejected"}
            >
              拒絕
            </Button>
            <Button type="submit" primary>
              提交審核
            </Button>
          </Button.Group>
        )}
        {results &&
          (results.status === 200 ? (
            <Message success header="審核成功!" content={results.message} />
          ) : (
            <Message
              error
              header="Action Forbidden"
              content={results.message}
            />
          ))}
      </Form>
    );
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await apiService.get(`list/leaving/`, {}, token);
        setLeavingList(response.data);
      } catch (error) {
        console.error("獲取請假記錄失敗:", error);
      }
      if (flag) {
        fetchLeavingDetail(selectedRequest.leave_id);
      }

      setFlag(false);
    };
    fetchLeaveRequests();
  }, [flag]);

  return (
    <Container>
      <Segment>
        <Header as="h1" textAlign="center">
          請假查詢
          {profile?.role}
        </Header>

        <Grid columns={2} divided>
          <Grid.Row>
            <Grid.Column width={6}>{renderLeaveList()}</Grid.Column>
            <Grid.Column width={10}>{renderLeaveDetails()}</Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </Container>
  );
}

export default LeaveApproval;
