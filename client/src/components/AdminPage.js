import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "./logo.svg"; // Import the logo image

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./AdminPage.css"; // Import the CSS module

const AdminPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token found
      return;
    }

    axios
      .get("https://casestudies.onrender.com/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setCaseStudies(response.data))
      .catch((error) => {
        console.error("Error fetching case studies:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from local storage
    navigate("/login"); // Redirect to the login page
  };

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [overviewTitle, setOverviewTitle] = useState(""); // New state for overview title
  const [overviewContent, setOverviewContent] = useState(""); // Renamed to clarify it's the content
  const [sections, setSections] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [heroImage, setHeroImage] = useState(null); // State to store the hero image file
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [caseStudies, setCaseStudies] = useState([]);

  // Categories and types options
  const categories = [
    "Strategy",
    "Web Design",
    "Branding",
    "Tech",
    "Marketing",
  ];
  const types = [
    "Hospitality",
    "Education",
    "Lifestyle",
    "Sports",
    "Architecture",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const response = await axios.get("https://casestudies.onrender.com/api/posts");
        setCaseStudies(response.data);
      } catch (error) {
        console.error("Error fetching case studies:", error.message);
      }
    };

    fetchCaseStudies();
  }, []);

  // Function to handle thumbnail upload (for homepage)
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "https://casestudies.onrender.com/api/upload/thumbnail",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setThumbnail(response.data.filename); // Set the uploaded thumbnail filename
    } catch (error) {
      console.error("Error uploading thumbnail:", error.message);
    }
  };

  // Function to handle hero image upload (for internal page)
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "https://casestudies.onrender.com/api/upload/hero",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setHeroImage(response.data.filename); // Set the uploaded hero image filename
      console.log("Uploaded Hero Image:", response.data.filename); // Log the uploaded filename
    } catch (error) {
      console.error("Error uploading hero image:", error.message);
    }
  };

  // Function to add a new section with a specific type
  const addSection = (sectionType) => {
    setSections([...sections, { type: sectionType, content: "", images: [] }]);
  };

  // Function to handle text content change
  const handleSectionContentChange = (index, value) => {
    const newSections = [...sections];
    newSections[index].content = value;
    setSections(newSections);
  };

  // Function to handle image uploads for sections
  const handleImageUpload = async (index, e, isSingleImage = true) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "https://casestudies.onrender.com/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newSections = [...sections];
      if (isSingleImage) {
        newSections[index].images[0] = response.data.filename;
      } else {
        newSections[index].images.push(response.data.filename);
      }
      setSections(newSections);
    } catch (error) {
      console.error("Error uploading image:", error.message);
    }
  };

  // Function to handle section deletion
  const handleDeleteSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  // Function to handle form submission for a new case study
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure category and type are selected
    if (!category || !type) {
      alert("Please select a category and a type for the case study.");
      return;
    }

    const newPost = {
      title,
      slug,
      subtitle,
      overviewTitle, // Add this
      overviewContent, // Add this
      thumbnail,
      heroImage,
      category,
      type,
      sections,
    };

    try {
      await axios.post("https://casestudies.onrender.com/api/posts", newPost);
      alert("Case study created successfully!");
      setTitle("");
      setSlug("");
      setSubtitle("");
      setOverviewTitle(""); // Reset the overview title field
      setOverviewContent(""); // Reset the overview content field
      setThumbnail(null);
      setHeroImage(null); // Reset the hero image field
      setCategory("");
      setType("");
      setSections([]);
      // Refetch case studies to include the new one
      const response = await axios.get("https://casestudies.onrender.com/api/posts");
      setCaseStudies(response.data);
    } catch (error) {
      console.error("Error creating case study:", error.message);
    }
  };

  // Function to handle the reordering of case studies
  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedCaseStudies = Array.from(caseStudies);
    const [movedCaseStudy] = reorderedCaseStudies.splice(
      result.source.index,
      1
    );
    reorderedCaseStudies.splice(result.destination.index, 0, movedCaseStudy);

    setCaseStudies(reorderedCaseStudies);

    // Save the new order to the server
    try {
      await axios.post("https://casestudies.onrender.com/api/posts/reorder", {
        caseStudies: reorderedCaseStudies,
      });
    } catch (error) {
      console.error("Error saving reordered case studies:", error.message);
    }
  };

  // Function to handle case study deletion with confirmation
  const handleDeleteCaseStudy = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this case study?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://casestudies.onrender.com/api/posts/${id}`);
      setCaseStudies(caseStudies.filter((caseStudy) => caseStudy._id !== id));
      alert("Case study deleted successfully!");
    } catch (error) {
      console.error("Error deleting case study:", error.message);
    }
  };

  // Determine if a case study is wide or small based on its position in the order
  const isWideLayout = (index) => index % 5 === 0;

  return (
    <div>
      <header>
        <img src={logo} alt="" className="logo" />
        <h1 className="heading">Create Case Study</h1>
        <button className="logout-btn"
          onClick={handleLogout}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            cursor: "pointer",
          }}
        >
<svg width="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4 4H13V9H11.5V5.5H5.5V18.5H11.5V15H13V20H4V4Z" fill="#1F2328"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.1332 11.25L15.3578 9.47463L16.4184 8.41397L20.0045 12L16.4184 15.586L15.3578 14.5254L17.1332 12.75H9V11.25H17.1332Z" fill="#1F2328"/>
</svg>
          Logout
        </button>
      </header>
      <div className="main-form">
        <form onSubmit={handleSubmit}>
          <div className="form-left">
            <div className="coolinput">
              <label htmlFor="input" className="text">
                Name:
              </label>
              <input
                type="text"
                placeholder="Case Study Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input"
              />
            </div>
            <div className="coolinput">
              <label htmlFor="input" className="text">
                Case Study URL:
              </label>
              <input
                type="text"
                placeholder="Slug (Case Study URL Name)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="input"
              />
            </div>
            <div className="coolinput">
              <label htmlFor="input" className="text">
                Hero Subtitle:
              </label>
              <input
                type="text"
                placeholder="Case Study Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="coolinput addbtn">
              <label htmlFor="input" className="text">
                Thumbnail (Show in Work Page):
              </label>
              <input
                type="file"
                onChange={handleThumbnailUpload}
                required
                className="input thumbbtn"
              />
              {thumbnail && (
                <img
                  src={`https://casestudies.onrender.com/uploads/thumbnails/${thumbnail}`}
                  alt="Thumbnail preview"
                  style={{ width: "100%", maxWidth: "100%", marginTop: "10px" }}
                />
              )}
            </div>
            <div className="coolinput addbtn">
              <label htmlFor="input" className="text">
                Hero Image (inside Case Study page):
              </label>
              <input
                type="file"
                onChange={handleHeroImageUpload}
                required
                className="input herobtn"
              />
              {heroImage && (
                <img
                  src={`https://casestudies.onrender.com/uploads/heroImages/${heroImage}`}
                  alt="Hero preview"
                  style={{ width: "100%", maxWidth: "100%", marginTop: "10px" }}
                />
              )}
            </div>

            <div className="coolinput">
              <label htmlFor="input" className="text">
                Project Overview Title:
              </label>
              <input
                type="text"
                placeholder="Project Overview Title"
                value={overviewTitle}
                onChange={(e) => setOverviewTitle(e.target.value)}
                required
                className="input"
              />
            </div>
            <div className="coolinput">
              <label htmlFor="input" className="text">
                Project Overview Subtitle:
              </label>
              <input
                type="text"
                placeholder="Project Overview Content"
                value={overviewContent}
                onChange={(e) => setOverviewContent(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="coolinput">
              <label htmlFor="input" className="text">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="input category"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="coolinput">
              <label htmlFor="input" className="text">
                Type:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="input type"
              >
                <option value="" disabled>
                  Select a type
                </option>
                {types.map((typ) => (
                  <option key={typ} value={typ}>
                    {typ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-center">
            <button type="button" onClick={() => addSection("text")}>
              Add Description
            </button>
            <button type="button" onClick={() => addSection("singleImage")}>
              Add Single Image
            </button>
            <button type="button" onClick={() => addSection("doubleImage")}>
              Add Double Image
            </button>
          </div>

          {sections.map((section, index) => (
            <div
              key={index}
              style={{ marginBottom: "20px", position: "relative" }}
            >
              <button
                type="button"
                onClick={() => handleDeleteSection(index)}
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>

              {section.type === "text" && (
                <textarea
                  placeholder="Enter text"
                  value={section.content}
                  onChange={(e) =>
                    handleSectionContentChange(index, e.target.value)
                  }
                  required
                ></textarea>
              )}
              {section.type === "singleImage" && (
                <div>
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(index, e, true)}
                  />
                  {section.images[0] && (
                    <img
                      src={`https://casestudies.onrender.com/uploads/${section.images[0]}`}
                      alt="preview"
                      style={{ width: "100%", maxWidth: "100%" }}
                    />
                  )}
                </div>
              )}
              {section.type === "doubleImage" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(index, e, false)}
                  />
                  {section.images.map((img, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={`https://casestudies.onrender.com/uploads/${img}`}
                      alt="preview"
                      style={{ width: "100%", maxWidth: "calc(50% - 5px)" }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          <button type="submit" className="submitbtn">
            Create Post
          </button>
        </form>
      </div>

      <h2 className="heading">Reorder Case Studies</h2>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="caseStudies">
          {(provided) => (
            <div
              className="case-studies-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {caseStudies.map((post, index) => (
                <Draggable key={post._id} draggableId={post._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="case-study-item"
                    >
                      <div>{post.title}</div>
                      <img
                        src={`https://casestudies.onrender.com/uploads/thumbnails/${post.thumbnail}`}
                        alt={post.title}
                        style={{ width: "100px", height: "auto" }}
                      />
                      <span
                        className={
                          isWideLayout(index) ? "wide-badge" : "small-badge"
                        }
                      >
                        {isWideLayout(index) ? "Wide" : "Small"}
                      </span>
                      <button
                        onClick={() => handleDeleteCaseStudy(post._id)}
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          padding: "5px",
                          cursor: "pointer",
                          marginTop: "10px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default AdminPage;
