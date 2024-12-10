import React, { useState, useEffect } from "react";
import {
  Segment,
  Header,
  Grid,
  Table,
  Dropdown,
  Message,
  Card,
} from "semantic-ui-react";
import apiService from "../context/apiService";

const StudentProfile = ({ token }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [message, setMessage] = useState({ content: "", type: "" });

  // 獲取班級列表
  const fetchClasses = async () => {
    try {
      const response = await apiService.get("list/class/", {}, token);
      const classOptions = response.data.map((classItem) => ({
        key: classItem.class_id,
        text: `${classItem.grade}年${classItem.class_name}班`,
        value: classItem.class_id,
        description: `${classItem.year}學年度`,
      }));
      setClasses(classOptions);
    } catch (error) {
      console.error("獲取班級列表失敗:", error);
      setMessage({ content: "獲取班級列表失敗", type: "error" });
    }
  };

  // 獲取班級學生列表
  const fetchClassStudents = async (classId) => {
    try {
      console.log(`class/${classId}/students/`);
      const response = await apiService.get(
        `class/${classId}/students/`,
        {},
        token
      );
      console.log(response.data);
      setStudents(response.data);
      setSelectedStudent(null); // 重置選中的學生
      setStudentDetail(null); // 重置學生詳細資料
    } catch (error) {
      console.error("獲取學生列表失敗:", error);
      setMessage({ content: "獲取學生列表失敗", type: "error" });
    }
  };

  // 獲取學生詳細資料
  const fetchStudentDetail = async (studentId) => {
    try {
      const response = await apiService.get(
        `students/${studentId}/`,
        {},
        token
      );
      console.log(response.data);
      setStudentDetail(response.data);
    } catch (error) {
      console.error("獲取學生詳細資料失敗:", error);
      setMessage({ content: "獲取學生詳細資料失敗", type: "error" });
    }
  };

  // 初始化獲取班級列表
  useEffect(() => {
    fetchClasses();
  }, [token]);

  // 當選擇班級時獲取學生列表
  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
    }
  }, [selectedClass]);

  // 當選擇學生獲取詳細資料
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentDetail(selectedStudent);
    }
  }, [selectedStudent]);

  return (
    <Segment>
      <Header as="h2">學生資料查詢</Header>
      {message.content && (
        <Message
          positive={message.type === "success"}
          negative={message.type === "error"}
          content={message.content}
        />
      )}

      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Dropdown
              placeholder="選擇班級"
              fluid
              selection
              options={classes}
              value={selectedClass || ""}
              onChange={(e, { value }) => setSelectedClass(value)}
            />
          </Grid.Column>
        </Grid.Row>

        {selectedClass && students.length > 0 && (
          <Grid.Row>
            <Grid.Column width={8}>
              <Table selectable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>學號</Table.HeaderCell>
                    <Table.HeaderCell>姓名</Table.HeaderCell>
                    <Table.HeaderCell>性別</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {students.map((student) => (
                    <Table.Row
                      key={student.user_id}
                      active={selectedStudent === student.user_id}
                      onClick={() => setSelectedStudent(student.user_id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Cell>{student.user_id}</Table.Cell>
                      <Table.Cell>{student.name}</Table.Cell>
                      <Table.Cell>{student.gender}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Grid.Column>

            <Grid.Column width={8}>
              {studentDetail && (
                <Card fluid>
                  <Card.Content>
                    <Card.Header>{studentDetail.name}</Card.Header>
                    <Card.Meta>學號：{studentDetail.user_id}</Card.Meta>
                    <Card.Description>
                      <Table basic="very">
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>班級</Table.Cell>
                            <Table.Cell>
                              {studentDetail.class_info.grade}年
                              {studentDetail.class_info.class_name}班
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>性別</Table.Cell>
                            <Table.Cell>{studentDetail.gender}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>生日</Table.Cell>
                            <Table.Cell>{studentDetail.birthday}</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Card.Description>
                  </Card.Content>
                </Card>
              )}
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </Segment>
  );
};

export default StudentProfile;
