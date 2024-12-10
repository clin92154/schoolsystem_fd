import React, { useState, useEffect } from "react";
import {
  Segment,
  Header,
  Table,
  Message,
  Grid,
  Statistic,
} from "semantic-ui-react";
import apiService from "../context/apiService";

const ScoreHistory = ({ token }) => {
  const [gradesHistory, setGradesHistory] = useState([]);
  const [message, setMessage] = useState({ content: "", type: "" });
  const [overallAverage, setOverallAverage] = useState(0);

  // 計算總平均
  const calculateOverallAverage = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const totalScore = grades.reduce((sum, semester) => {
      return sum + Number(semester.overall_average);
    }, 0);
    return (totalScore / grades.length).toFixed(2);
  };

  // 獲取歷史成績
  const fetchGradesHistory = async () => {
    try {
      const response = await apiService.get("student/all-grades/", {}, token);
      setGradesHistory(response.data.grades_history);
      setOverallAverage(calculateOverallAverage(response.data.grades_history));
    } catch (error) {
      console.error("獲取歷史成績失敗:", error);
      if (error.response?.status === 403) {
        setMessage({
          content: "只有學生可以查看自己的成績",
          type: "error",
        });
      } else if (error.response?.status === 404) {
        setMessage({ content: "尚無成績記錄", type: "warning" });
      } else {
        setMessage({ content: "獲取成績失敗", type: "error" });
      }
    }
  };

  useEffect(() => {
    fetchGradesHistory();
  }, [token]);

  return (
    <Segment>
      <Header as="h2">歷年成績單</Header>
      {message.content && (
        <Message
          positive={message.type === "success"}
          negative={message.type === "error"}
          warning={message.type === "warning"}
          content={message.content}
        />
      )}

      <Grid columns={2} divided>
        {gradesHistory.map((semesterData, semesterIndex) => (
          <Grid.Column key={semesterData.semester}>
            <Table celled compact size="small">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell colSpan="2">
                    {semesterData.semester}學期
                  </Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell width={12}>科目名稱</Table.HeaderCell>
                  <Table.HeaderCell width={4}>成績</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {semesterData.courses.map((course, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{course.course_name}</Table.Cell>
                    <Table.Cell>
                      {course.average ? Number(course.average).toFixed(0) : "-"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>

              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell>學期平均</Table.HeaderCell>
                  <Table.HeaderCell>
                    {Number(semesterData.overall_average).toFixed(2)}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </Table>
          </Grid.Column>
        ))}
      </Grid>

      {gradesHistory.length > 0 && (
        <Segment textAlign="center" color="blue">
          <Statistic size="large">
            <Statistic.Value>{overallAverage}</Statistic.Value>
            <Statistic.Label>歷年平均</Statistic.Label>
          </Statistic>
        </Segment>
      )}
    </Segment>
  );
};

export default ScoreHistory;
