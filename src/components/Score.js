import React, { useState, useEffect } from "react";
import {
  Segment,
  Header,
  Table,
  Message,
  Dropdown,
  Statistic,
} from "semantic-ui-react";
import apiService from "../context/apiService";

const Score = ({ token }) => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [grades, setGrades] = useState([]);
  const [overallAverage, setOverallAverage] = useState(null);
  const [message, setMessage] = useState({ content: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  // 獲取學期列表
  const fetchSemesters = async () => {
    try {
      const response = await apiService.get("list/semester/", {}, token);
      const semesterOptions = response.data.map((semester) => ({
        key: semester.semester_id,
        text: `${semester.year} 學年度 第 ${semester.term} 學期`,
        value: semester.semester_id,
      }));
      setSemesters(semesterOptions);
    } catch (error) {
      console.error("獲取學期列表失敗:", error.data);
      setMessage({
        content: `獲取學期列表失敗${error.data}`,
        type: "error",
      });
    }
  };

  // 獲取選定學期的成績
  const fetchSemesterGrades = async (semesterId) => {
    setIsLoading(true);
    try {
      const response = await apiService.get(
        `student/semester-grades/${semesterId}/`,
        {},
        token
      );
      setGrades(response.data.grades);
      setOverallAverage(Number(response.data.overall_average).toFixed(2));
      setMessage({ content: "", type: "" });
    } catch (error) {
      console.error("獲取成績失敗:", error);
      if (error.response?.status === 403) {
        setMessage({
          content: "只有學生可以查看自己的成績",
          type: "error",
        });
      } else {
        console.log(error.response);
        setMessage({
          content: `獲取成績失敗:${error.response.data?.detail}`,
          type: "error",
        });
      }
      setGrades([]);
      setOverallAverage(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [token]);

  // 當選擇的學期改變時獲取成績
  useEffect(() => {
    if (selectedSemester) {
      fetchSemesterGrades(selectedSemester);
    }
  }, [selectedSemester]);

  return (
    <Segment>
      <Header as="h2">學期成績查詢</Header>
      {message.content && (
        <Message
          positive={message.type === "success"}
          negative={message.type === "error"}
          content={message.content}
        />
      )}

      <Dropdown
        placeholder="請選擇學期"
        fluid
        selection
        options={semesters}
        value={selectedSemester || ""}
        onChange={(e, { value }) => setSelectedSemester(value)}
        loading={isLoading}
      />

      {selectedSemester && grades.length > 0 && (
        <>
          <Segment textAlign="center" color="blue" style={{ marginTop: "2em" }}>
            <Statistic size="large">
              <Statistic.Value>{overallAverage}</Statistic.Value>
              <Statistic.Label>學期平均</Statistic.Label>
            </Statistic>
          </Segment>

          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>課程名稱</Table.HeaderCell>
                <Table.HeaderCell>期中考</Table.HeaderCell>
                <Table.HeaderCell>期末考</Table.HeaderCell>
                <Table.HeaderCell>學期成績</Table.HeaderCell>
                <Table.HeaderCell>排名</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {grades.map((course, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{course.course_name}</Table.Cell>
                  <Table.Cell>
                    {course.middle_score
                      ? Number(course.middle_score).toFixed(2)
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {course.final_score
                      ? Number(course.final_score).toFixed(2)
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {course.average ? Number(course.average).toFixed(2) : "-"}
                  </Table.Cell>
                  <Table.Cell>{course.rank || "-"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <Statistic.Group
            widths="two"
            size="small"
            style={{ marginTop: "2em" }}
          >
            <Statistic color="blue">
              <Statistic.Value>{overallAverage}</Statistic.Value>
              <Statistic.Label>學期平均</Statistic.Label>
            </Statistic>
            <Statistic color="green">
              <Statistic.Value>{grades.length}</Statistic.Value>
              <Statistic.Label>總課程數</Statistic.Label>
            </Statistic>
          </Statistic.Group>
        </>
      )}
    </Segment>
  );
};

export default Score;
