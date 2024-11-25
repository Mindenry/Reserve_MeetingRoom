import React, { useState } from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";

const ContactSection = () => {
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission logic
    // Example: submitContactForm(contactData).then(response => handleContactResponse(response));
    console.log("Contact form submitted:", contactData);
    alert("ข้อความถูกส่งเรียบร้อยแล้ว! (จำลอง)");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">ติดต่อเรา</h2>
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <Mail className="mr-3 text-blue-500" />
          <span>support@mutreserve.com</span>
        </div>
        <div className="flex items-center">
          <Phone className="mr-3 text-blue-500" />
          <span>+66 2 123 4567</span>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            ชื่อ
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={contactData.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            อีเมล
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={contactData.email}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="subject"
          >
            หัวข้อ
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={contactData.subject}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="message"
          >
            ข้อความ
          </label>
          <textarea
            id="message"
            name="message"
            value={contactData.message}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            required
          ></textarea>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            <MessageSquare className="mr-2" size={18} />
            ส่งข้อความ
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactSection;
