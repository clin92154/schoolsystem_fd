import React, { useState, useEffect } from "react";
import {
  Segment,
  Header,
  Form,
  Table,
  Button,
  Message,
  Dropdown,
} from "semantic-ui-react";
import apiService from "../context/apiService";

const ScoreRegister = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState({ content: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  // 獲取課程列表
  const fetchCourses = async () => {
    try {
      const response = await apiService.get("list/courses/", {}, token);
      const courseOptions = response.data.map((course) => ({
        key: course.course_id,
        text: `${course.course_name} - ${course.class}`,
        value: course.course_id,
        description: course.course_description,
      }));
      setCourses(courseOptions);
    } catch (error) {
      console.error("獲取課程失敗:", error);
      setMessage({ content: "獲取課程失敗", type: "error" });
    }
  };

  // 獲取學生成績
  const fetchStudentGrades = async (courseId) => {
    setIsLoading(true);
    try {
      const response = await apiService.get(
        `course/${courseId}/class-grades/`,
        {},
        token
      );
      setStudents(response.data);
    } catch (error) {
      console.error("獲取成績失敗:", error);
      setMessage({ content: "獲取成績失敗", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 處理成績更新
  const handleScoreChange = (studentId, field, value) => {
    const numValue = value === "" ? null : Number(value);
    if (numValue !== null && (numValue < 0 || numValue > 100)) {
      return; // 不允許超出範圍的分數
    }

    setStudents(
      students.map((student) =>
        student.student_id === studentId
          ? { ...student, [field]: numValue }
          : student
      )
    );
  };

  // 修改儲存成績的函數
  const handleSaveGrades = async () => {
    try {
      // 修改成符合 API 要求的資料格式
      const requestData = {
        grades: students.map((student) => ({
          student_id: student.student_id,
          middle_score: student.middle_score,
          final_score: student.final_score,
        })),
      };

      await apiService.put(
        `course/${selectedCourse}/grade-input/`,
        requestData, // 使用新的資料格式
        token
      );

      setMessage({ content: "成績儲存成功！", type: "success" });
      // 重新獲取最新成績
      fetchStudentGrades(selectedCourse);
    } catch (error) {
      console.error("儲存成績失敗:", error);
      setMessage({
        content: error.response?.data?.detail || "儲存成績失敗",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentGrades(selectedCourse);
    }
  }, [selectedCourse]);

  return (
    <Segment>
      <Header as="h2">成績登錄</Header>
      {message.content && (
        <Message
          positive={message.type === "success"}
          negative={message.type === "error"}
          content={message.content}
        />
      )}

      <Form>
        <Form.Field>
          <label>選擇課程</label>
          <Dropdown
            placeholder="請選擇課程"
            fluid
            selection
            options={courses}
            value={selectedCourse || ""}
            onChange={(e, { value }) => setSelectedCourse(value)}
          />
        </Form.Field>
      </Form>

      {selectedCourse && students.length > 0 && (
        <>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>學號</Table.HeaderCell>
                <Table.HeaderCell>姓名</Table.HeaderCell>
                <Table.HeaderCell>期中考</Table.HeaderCell>
                <Table.HeaderCell>期末考</Table.HeaderCell>
                <Table.HeaderCell>平均</Table.HeaderCell>
                <Table.HeaderCell>排名</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {students.map((student) => (
                <Table.Row key={student.student_id}>
                  <Table.Cell>{student.student_id}</Table.Cell>
                  <Table.Cell>{student.student_name}</Table.Cell>
                  <Table.Cell>
                    <Form.Input
                      type="number"
                      min="0"
                      max="100"
                      value={student.middle_score || ""}
                      onChange={(e) =>
                        handleScoreChange(
                          student.student_id,
                          "middle_score",
                          e.target.value
                        )
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input
                      type="number"
                      min="0"
                      max="100"
                      value={student.final_score || ""}
                      onChange={(e) =>
                        handleScoreChange(
                          student.student_id,
                          "final_score",
                          e.target.value
                        )
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>{student.average || "-"}</Table.Cell>
                  <Table.Cell>{student.rank || "-"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <Button
            primary
            onClick={handleSaveGrades}
            loading={isLoading}
            style={{ marginTop: "1em" }}
          >
            儲存成績
          </Button>
        </>
      )}
    </Segment>
  );
};

export default ScoreRegister;
