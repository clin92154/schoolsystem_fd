import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Message,
  Dropdown,
  TextArea,
  Checkbox,
  Segment,
  Header,
  Select,
} from "semantic-ui-react";
import DatePicker from "react-semantic-ui-datepickers";
import apiService from "../context/apiService";

const LeaveApplication = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [Periods, setPeriods] = useState([]);
  const [isAllPeriods, setIsAllPeriods] = useState(false); // 新增: 判斷是否為"全部時段"
  const [selectedPeriods, setSelectedPeriods] = useState([]); // 紀錄選擇的時段
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [leaveTypeId, setLeaveTypeId] = useState(null);
  const [reason, setReason] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormSubmitted(false);

    const fetchLeaveTypes = async () => {
      try {
        const response = await apiService.get("list/leave-type/", {});
        setLeaveTypes(response.data);
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    };

    const fetchPeriodTypes = async () => {
      try {
        const response = await apiService.get("list/period/", {});
        setPeriods(response.data);
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };

    fetchLeaveTypes();
    fetchPeriodTypes();
  }, []);

  useEffect(() => {
    // 檢查是否顯示全時段選項
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        alert("結束日期不能在開始日期之前");
        // 同時清空開始日期和結束日期
        setStartDate(null);
        setEndDate(null);
      } else if (startDate !== endDate) {
        setIsAllPeriods(true);
        setSelectedPeriods(Periods.map((option) => option.period_number)); // 全選所有時段
      }
    } else {
      setIsAllPeriods(false);
      setSelectedPeriods([]); // 清空選擇的時段
    }
  }, [startDate, endDate]);

  const handlePeriodChange = (e, { value }) => {
    setFormSubmitted(false);
    if (value === "all") {
      setIsAllPeriods(!isAllPeriods);
      if (!isAllPeriods) {
        setSelectedPeriods(Periods.map((option) => option.period_number)); // 全選所有時段
      } else {
        setSelectedPeriods([]); // 清空選擇的時段
      }
    } else {
      const updatedPeriods = selectedPeriods.includes(value)
        ? selectedPeriods.filter((p) => p !== value)
        : [...selectedPeriods, value].sort((a, b) => a - b); // 添加排序
      setSelectedPeriods(updatedPeriods);
      // 檢查是否全選
      setIsAllPeriods(updatedPeriods.length === Periods.length);
    }
  };

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    setError(""); // 重置錯誤訊息
    const stoken = sessionStorage.getItem("accessToken");

    // 表單驗證
    if (!leaveTypeId || !reason.trim() || !startDate || !endDate) {
      setError("請填寫所有必填欄位");
      return;
    }

    if (selectedPeriods.length === 0) {
      setError("請至少選擇一個時段");
      return;
    }

    // 假單申請資料
    const leaveRequestData = {
      leave_type: leaveTypeId,
      reason: reason,
      start_datetime: startDate,
      end_datetime: endDate,
      period: selectedPeriods,
    };

    try {
      // 提交假單申請
      const response = await apiService.post(
        "leaving-application/",
        leaveRequestData,
        stoken
      );

      if (response.status === 201) {
        setFormSubmitted(true);
        // 清空表單
        setLeaveTypeId(null);
        setReason("");
        setStartDate(null);
        setEndDate(null);
        setSelectedPeriods([]);
        setIsAllPeriods(false);
        setError(""); // 清空錯誤訊息
      }
    } catch (error) {
      console.error("Error submitting leave application:", error);
      const errorMessage =
        error.response?.data?.detail || "提交失敗，請再試一次";
      console.log(error);
      setError(errorMessage);
    }
  };

  return (
    <Container>
      <Segment>
        <Header as="h1">假單申請</Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          error={!!error}
          success={formSubmitted}
        >
          <Form.Field required>
            <label>請假類型</label>
            <Dropdown
              placeholder="選擇請假類型"
              fluid
              selection
              options={leaveTypes.map((type) => ({
                key: type.id,
                text: type.type_name,
                value: type.id,
              }))}
              name="leave_type"
              onChange={(e, { value }) => setLeaveTypeId(value)}
            />
          </Form.Field>
          <Form.Field required>
            <label>開始日期</label>
            <DatePicker
              value={startDate ? new Date(startDate) : null}
              onChange={(event, data) => {
                setStartDate(formatDate(data.value));
              }}
            />
          </Form.Field>
          <Form.Field required>
            <label>結束日期</label>
            <DatePicker
              value={endDate ? new Date(endDate) : null}
              onChange={(event, data) => {
                setEndDate(formatDate(data.value));
              }}
            />
          </Form.Field>
          {startDate && endDate && startDate === endDate && (
            <Form.Field required>
              <label>請假節數</label>
              <div className="ui checkbox" style={{ marginBottom: "10px" }}>
                <Checkbox
                  key="all"
                  label="全天"
                  value="all"
                  checked={isAllPeriods}
                  onChange={handlePeriodChange}
                />
              </div>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {!isAllPeriods &&
                  Periods.map((option) => (
                    <div key={option.period_number} className="ui checkbox">
                      <Checkbox
                        label={`第${option.period_number}節`}
                        value={option.period_number}
                        checked={selectedPeriods.includes(option.period_number)}
                        onChange={handlePeriodChange}
                      />
                    </div>
                  ))}
              </div>
            </Form.Field>
          )}
          <Form.Field required>
            <label>請假原因</label>
            <TextArea
              placeholder="請輸入請假原因"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Form.Field>
          {error && <Message error content={error} />}
          <Button type="submit" primary disabled={isLoading}>
            {isLoading ? "提交中..." : "提交申請"}
          </Button>
          {formSubmitted && <Message success content="請假申請已成功提交" />}
        </Form>
      </Segment>
    </Container>
  );
};

export default LeaveApplication;
