import React, { useState, useEffect } from "react";
import {
  Segment,
  Header,
  Button,
  Grid,
  Form,
  Select,
  Message,
  Dropdown,
  TextArea,
} from "semantic-ui-react";
import apiService from "../context/apiService";

const CourseManage = ({ token }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [message, setMessage] = useState({ content: "", type: "" });
  const [formData, setFormData] = useState({
    course_name: "",
    course_description: "",
    semester: "",
    class_id: "",
    periods: [],
    day_of_week: "",
  });

  // 新增選項的state
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 修改 handleInputChange

  const handleInputChange = (name, value) => {
    console.log(value);
    // 當輸入框失去焦點時才更新
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //取得詳細課程資訊
  const fetchSelectedCourse = async (courseId) => {
    try {
      const response = await apiService.get(
        `course/manage/${courseId}/`,
        {},
        token
      );
      const courseData = response.data;
      console.log(courseData);
      // 更新表單資料
      setFormData({
        course_name: courseData.course_name,
        course_description: courseData.course_description || "",
        semester: courseData.semester,
        class_id: courseData.class_name,
        periods: courseData.periods.map((p) => p), // 假設回傳的是period物件陣列
        day_of_week: courseData.day_of_week,
      });
    } catch (error) {
      console.error("獲取課程詳細資料失敗:", error);
      setMessage({
        content: "獲取課程詳細資料失敗:" + error,
        type: "error",
      });
    }
  };

  // 獲取所有課程
  const fetchCourses = async () => {
    try {
      const response = await apiService.get("list/courses/", {}, token);
      const courseOptions = response.data.map((course) => ({
        key: course.course_id,
        text: course.course_name,
        value: course.course_id,
      }));
      setCourses(courseOptions);
    } catch (error) {
      console.error("獲取課程失敗:", error);
      setMessage({ content: "獲取課程失敗", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchCourses();
  }, [token]);

  const handleSectionSelect = (section) => {
    setIsLoading(true);
    setActiveSection(section);
    setSelectedCourse(null);
    setFormData({
      course_name: "",
      course_description: "",
      semester: "",
      class_id: "",
      periods: [],
      day_of_week: "",
    });
    setMessage({ content: "", type: "" });
    setIsLoading(false);
  };

  // 新增課程
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      // 確保資料格式正確
      const submitData = {
        course_name: formData.course_name,
        course_description: formData.course_description || "",
        semester: formData.semester, // 確保是數字
        class_id: formData.class_id,
        period: formData.periods.map((p) => parseInt(p)), // 確保是數字陣列
        day_of_week: formData.day_of_week,
      };

      const response = await apiService.post(
        "course/manage/",
        submitData,
        token
      );
      if (response.status === 201) {
        setMessage({ content: "課程新增成功！", type: "success" });
        fetchCourses();
        // 重置表單
        setFormData({
          course_name: "",
          course_description: "",
          semester: "",
          class_id: "",
          periods: [],
          day_of_week: "",
        });
      }
    } catch (error) {
      setMessage({
        content: error.response?.data?.detail || "新增失敗",
        type: "error",
      });
    }
  };

  // 修改課程
  const handleModifyCourse = async (e) => {
    e.preventDefault();
    try {
      // 確保資料格式正確
      const submitData = {
        course_name: formData.course_name,
        course_description: formData.course_description || "",
        semester: formData.semester, // 確保是數字
        class_id: formData.class_id,
        period: formData.periods.map((p) => parseInt(p)),
        day_of_week: formData.day_of_week,
      };

      const response = await apiService.put(
        `course/manage/${selectedCourse}/`,
        submitData,
        token
      );
      if (response.status === 200) {
        setMessage({ content: "課程修改成功！", type: "success" });
        fetchCourses();
      }
    } catch (error) {
      setMessage({
        content: error.response?.data?.detail || "修改失敗",
        type: "error",
      });
    }
  };

  // 刪除課程
  const handleDeleteCourse = async () => {
    try {
      const response = await apiService.delete(
        `course/manage/${selectedCourse}/`,
        token
      );
      if (response.status === 200) {
        setMessage({ content: "課程刪除成功！", type: "success" });
        fetchCourses();
        setSelectedCourse(null);
      }
    } catch (error) {
      setMessage({
        content: error.response?.data?.detail || "刪除失敗",
        type: "error",
      });
    }
  };

  // 獲取學期選項
  const fetchSemesters = async () => {
    try {
      const response = await apiService.get("list/semester/", {}, token);
      console.log(response.data);
      const semesterOptions = response.data.map((semester) => ({
        key: semester.semester_id,
        text: `${semester.year}學年度 第${semester.term}學期`,
        value: semester.semester_id,
      }));

      setSemesters(semesterOptions);
    } catch (error) {
      console.error("獲取學期資料失敗:", error);
    }
  };

  // 獲取班級選項
  const fetchClasses = async () => {
    try {
      const response = await apiService.get("list/class/", {}, token);
      const classOptions = response.data.map((classItem) => ({
        key: classItem.class_id,
        text: `${classItem.class_name} (${classItem.grade}年級)`,
        value: classItem.class_id,
      }));
      setClasses(classOptions);
    } catch (error) {
      console.error("獲取班級資料失敗:", error);
    }
  };

  // 獲取節次選項
  const fetchPeriods = async () => {
    try {
      const response = await apiService.get("list/period/", {}, token);
      const periodOptions = response.data.map((period) => ({
        key: period.period_number,
        text: `第${period.period_number}節(上課時段${period.begin_time}~${period.end_time})`,
        value: period.period_number,
      }));
      setPeriods(periodOptions);
    } catch (error) {
      console.error("獲取節次資料失敗:", error);
    }
  };

  // 獲取上課時間選項
  const fetchDaysOfWeek = async () => {
    try {
      const response = await apiService.get("list/days-of-week/", {}, token);
      const dayOptions = response.data.map((day) => ({
        key: day.toLowerCase(),
        text: day,
        value: day,
      }));
      setDaysOfWeek(dayOptions);
    } catch (error) {
      console.error("獲取上課時間資料失敗:", error);
    }
  };

  // 在組件載入時獲取所有選項資料
  useEffect(() => {
    fetchSemesters();
    fetchClasses();
    fetchPeriods();
    fetchDaysOfWeek();
  }, [token]);

  // 將 AddCourseSection 改為普通函數組件
  const AddCourseSection = () => (
    <Segment>
      <Header as="h3">新增課程</Header>
      <Form onSubmit={handleAddCourse} loading={isLoading}>
        <Form.Field required>
          <label>課程名稱</label>
          <input
            name="course_name"
            defaultValue={formData.course_name || ""}
            onBlur={(e) => handleInputChange("course_name", e.target.value)}
            placeholder="請輸入課程名稱"
          />
        </Form.Field>

        <Form.Field>
          <label>課程描述</label>
          <TextArea
            name="course_description"
            defaultValue={formData.course_description || ""}
            onBlur={(e) =>
              handleInputChange("course_description", e.target.value)
            }
            placeholder="請輸入課程描述"
          />
        </Form.Field>

        <Form.Field required>
          <label>學期</label>
          <Dropdown
            placeholder="選擇學期"
            fluid
            selection
            options={semesters}
            value={formData.semester || ""}
            onChange={(e, { value }) => handleInputChange("semester", value)}
          />
        </Form.Field>

        <Form.Field required>
          <label>班級</label>
          <Dropdown
            placeholder="選擇班級"
            fluid
            selection
            options={classes}
            value={formData.class_id || ""}
            onChange={(e, { value }) => {
              console.log(value);
              handleInputChange("class_id", value);
            }}
          />
        </Form.Field>

        <Form.Field required>
          <label>上課時間</label>
          <Dropdown
            placeholder="選擇上課時間"
            fluid
            selection
            options={daysOfWeek}
            value={formData.day_of_week || ""}
            onChange={(e, { value }) => handleInputChange("day_of_week", value)}
          />
        </Form.Field>

        <Form.Field required>
          <label>節次</label>
          <Dropdown
            placeholder="選擇節次"
            fluid
            multiple
            selection
            options={periods}
            value={formData.periods || []}
            onChange={(e, { value }) => handleInputChange("periods", value)}
          />
        </Form.Field>

        <Button primary type="submit">
          新增課程
        </Button>
      </Form>
    </Segment>
  );

  // 將 ModifyCourseSection 改為普通函數組件
  const ModifyCourseSection = () => (
    <Segment>
      <Header as="h3">修改課程</Header>
      <Form onSubmit={handleModifyCourse} loading={isLoading}>
        <Form.Field
          control={Dropdown}
          options={courses}
          placeholder="請選擇要修改的課程"
          value={selectedCourse}
          onChange={(e, { value }) => {
            setSelectedCourse(value);
            fetchSelectedCourse(value);
          }}
          selection
          fluid
          required
        />

        {selectedCourse && (
          <>
            <Form.Field required>
              <label>課程名稱</label>
              <input
                name="course_name"
                defaultValue={formData.course_name || ""}
                onBlur={(e) => handleInputChange("course_name", e.target.value)}
                placeholder="請輸入課程名稱"
              />
            </Form.Field>

            <Form.Field>
              <label>課程描述</label>
              <TextArea
                name="course_description"
                defaultValue={formData.course_description || ""}
                onBlur={(e) =>
                  handleInputChange("course_description", e.target.value)
                }
                placeholder="請輸入課程描述"
              />
            </Form.Field>

            <Form.Field required>
              <label>學期</label>
              <Dropdown
                placeholder="選擇學期"
                fluid
                selection
                options={semesters}
                value={formData.semester || ""}
                onChange={(e, { value }) =>
                  handleInputChange("semester", value)
                }
              />
            </Form.Field>
            <Form.Field required>
              <label>班級</label>
              <Dropdown
                placeholder="選擇班級"
                fluid
                selection
                options={classes}
                value={formData.class_id || ""}
                onChange={(e, { value }) => {
                  handleInputChange("class_id", value);
                }}
              />
            </Form.Field>
            {/* 
            <Form.Field required>
              <label>班級</label>
              <Dropdown
                placeholder="選擇班級"
                fluid
                selection
                options={classes}
                value={formData.class_id || ""}
                onChange={(e, { value }) =>
                  handleInputChange("class_id", value)
                }
              />
            </Form.Field> */}
            <Form.Field required>
              <label>上課時間</label>
              <Dropdown
                placeholder="選擇上課時間"
                fluid
                selection
                options={daysOfWeek}
                value={formData.day_of_week || ""}
                onChange={(e, { value }) =>
                  handleInputChange("day_of_week", value)
                }
              />
            </Form.Field>

            <Form.Field required>
              <label>節次</label>
              <Dropdown
                placeholder="選擇節次"
                fluid
                multiple
                selection
                options={periods}
                value={formData.periods || []}
                onChange={(e, { value }) => handleInputChange("periods", value)}
              />
            </Form.Field>

            <Button primary type="submit">
              更新課程
            </Button>
          </>
        )}
      </Form>
    </Segment>
  );

  return (
    <Segment>
      <Header as="h2">課程管理</Header>
      {message.content && (
        <Message
          positive={message.type === "success"}
          negative={message.type === "error"}
          content={message.content}
        />
      )}

      <Grid columns={3} divided>
        <Grid.Row>
          <Grid.Column>
            <Button
              fluid
              color={activeSection === "add" ? "blue" : null}
              onClick={() => handleSectionSelect("add")}
            >
              新增課程
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button
              fluid
              color={activeSection === "modify" ? "blue" : null}
              onClick={() => handleSectionSelect("modify")}
            >
              修改課程
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button
              fluid
              color={activeSection === "delete" ? "blue" : null}
              onClick={() => handleSectionSelect("delete")}
            >
              刪除課程
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      {activeSection === "add" && <AddCourseSection />}
      {activeSection === "modify" && <ModifyCourseSection />}
      {activeSection === "delete" && (
        <Segment>
          <Header as="h3">刪除課程</Header>
          <Form loading={isLoading}>
            <Form.Field
              control={Select}
              options={courses}
              placeholder="請選擇要刪除的課程"
              value={selectedCourse}
              onChange={(e, { value }) => setSelectedCourse(value)}
            />
            {selectedCourse && (
              <Button negative onClick={handleDeleteCourse}>
                確認刪除
              </Button>
            )}
          </Form>
        </Segment>
      )}
    </Segment>
  );
};

export default CourseManage;
