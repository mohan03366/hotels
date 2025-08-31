import React from "react";
import "./About.css";

function About() {
  return (
    <div>
      <h1 className="text-center about__hero mt-5">About Us</h1>
      <div className="container">
        <p className="about__paragraph">
          Welcome to <strong>Hotel Royal Blue Star</strong>, the rising guest
          house and banquet hall of North Bihar. Conveniently located in
          Muzaffarpur, near SKMCH overbridge in front of the petrol pump
          (842001), our hotel offers comfort and elegance at the heart of the
          city.
        </p>
        <p className="about__paragraph mt-3">
          We provide a wide range of facilities including well-furnished rooms,
          spacious banquet halls, multi-cuisine restaurants, party halls, and a
          secure parking area. At Hotel Royal Blue Star, we are committed to
          making your stay memorable — whether you are here for leisure,
          celebrations, or business.
        </p>
      </div>
    </div>
  );
}

export default About;
