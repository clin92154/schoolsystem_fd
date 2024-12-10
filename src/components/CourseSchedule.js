import React, { useState, useEffect } from "react";
import { Segment, Header, Table, Message, Dropdown } from "semantic-ui-react";
import apiService from "../context/apiService";

const CourseSchedule = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState({ content: "", type: "" });
  const [schedule, setSchedule] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 定義星期幾的順序
  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // 定義節次範圍（假設是 1-8 節）
  const periods = Array.from({ length: 9 }, (_, i) => i + 1);

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
      console.error("獲取學期列表失敗:", error);
      setMessage({ content: "獲取學期列表失敗", type: "error" });
    }
    setIsLoading(false);
  };
  // 獲取課程列表
  const fetchCourses = async () => {
    try {
      const response = await apiService.get(
        "list/courses/",
        { semester_id: selectedSemester },
        token
      );
      setCourses(response.data);

      // 整理課表資料
      const scheduleData = {};
      daysOrder.forEach((day) => {
        scheduleData[day] = {};
        periods.forEach((period) => {
          scheduleData[day][period] = null;
        });
      });

      // 將課程資料填入課表
      response.data.forEach((course) => {
        course.periods.forEach((period) => {
          if (!scheduleData[course.day_of_week][period]) {
            scheduleData[course.day_of_week][period] = {
              course_name: course.course_name,
              teacher_name: course.teacher_name,
              class: course.class,
            };
          }
        });
      });

      setSchedule(scheduleData);
    } catch (error) {
      console.error("獲取課表失敗:", error);
      setMessage({ content: "獲取課表失敗", type: "error" });
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [token]);

  // 當選擇的學期改變時獲取成績
  useEffect(() => {
    setIsLoading(true);
    if (selectedSemester) {
      fetchCourses();
      setIsLoading(false);
    }
  }, [selectedSemester]);

  // 轉換星期幾的顯示文字
  const getDayText = (day) => {
    const dayMap = {
      Monday: "星期一",
      Tuesday: "星期二",
      Wednesday: "星期三",
      Thursday: "星期四",
      Friday: "星期五",
      Saturday: "星期六",
      Sunday: "星期日",
    };
    return dayMap[day];
  };

  return (
    <Segment>
      <Header as="h2">課表查詢</Header>
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
      <Table celled structured>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>節次</Table.HeaderCell>
            {daysOrder.map((day) => (
              <Table.HeaderCell key={day}>{getDayText(day)}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {periods.map((period) => (
            <Table.Row key={period}>
              <Table.Cell>{`第 ${period} 節`}</Table.Cell>
              {daysOrder.map((day) => (
                <Table.Cell key={`${day}-${period}`}>
                  {schedule[day]?.[period] ? (
                    <div>
                      <div>{schedule[day][period].course_name}</div>
                      <div style={{ fontSize: "0.8em", color: "grey" }}>
                        {schedule[day][period].teacher_name}
                      </div>
                      <div style={{ fontSize: "0.8em", color: "grey" }}>
                        {schedule[day][period].class}
                      </div>
                    </div>
                  ) : null}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* 顯示課程詳細資訊 */}
      <Segment>
        <Header as="h3">課程詳細資訊</Header>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>課程名稱</Table.HeaderCell>
              <Table.HeaderCell>教師</Table.HeaderCell>
              <Table.HeaderCell>班級</Table.HeaderCell>
              <Table.HeaderCell>上課時間</Table.HeaderCell>
              <Table.HeaderCell>課程描述</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {courses.map((course) => (
              <Table.Row key={course.course_id}>
                <Table.Cell>{course.course_name}</Table.Cell>
                <Table.Cell>{course.teacher_name}</Table.Cell>
                <Table.Cell>{course.class}</Table.Cell>
                <Table.Cell>
                  {`${getDayText(course.day_of_week)} 第 ${course.periods.join(
                    ","
                  )} 節`}
                </Table.Cell>
                <Table.Cell>{course.course_description}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Segment>
    </Segment>
  );
};

export default CourseSchedule;
