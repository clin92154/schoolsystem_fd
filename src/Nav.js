import apiService from "./context/apiService";
import React, { useState, useEffect } from "react";
import { Dropdown, Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";

function Nav() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const stoken = sessionStorage.getItem("accessToken");
        if (stoken) {
          const response = await apiService.get("categories/", {}, stoken);
          console.log(response.data.data);
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Menu vertical>
      {categories.map((category) => (
        <Dropdown
          item
          text={category.name}
          key={category.name}
          className="link item"
        >
          <Dropdown.Menu>
            {category.subcategory.map((sub) => (
              <Dropdown.Item>
                <NavLink to={sub.url}>{sub.name}</NavLink>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ))}
    </Menu>
  );
}

export default Nav;
