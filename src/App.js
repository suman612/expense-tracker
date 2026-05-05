// App.jsx
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import * as XLSX from 'xlsx';

const App = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    age: '',
    parentName: '',
    address: '',
    contactNo: '',
    emailId: '',
    references: [],
    activities: []
  });
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const OFFICE_WHATSAPP = "918587906794";

  // Reference options
  const referenceOptions = ['Facebook', 'Instagram', 'YouTube', 'Google', 'Friend'];
  
  // Activity options
  const activityOptions = [
    'Dance', 'Fitness', 'Music', 'Aerial Dance', 'Gymnastics', 
    'Wedding Choreography', 'Theatre', 'Dance Courses', 'Teaching Courses'
  ];

  // Initialize signature pad
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    const container = canvas.parentElement;
    let width = container.clientWidth;
    if (width > 500) width = 500;
    canvas.width = width;
    canvas.height = 180;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e2a3e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctxRef.current = ctx;
    
    // Handle window resize
    const handleResize = () => {
      const newContainer = canvas.parentElement;
      let newWidth = newContainer.clientWidth;
      if (newWidth > 500) newWidth = 500;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = newWidth;
      canvas.height = 180;
      ctx.putImageData(imageData, 0, 0);
      ctx.strokeStyle = '#1e2a3e';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = ctxRef.current;
    if (ctx) ctx.beginPath();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const isSignatureNonEmpty = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return false;
    
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] < 250) return true;
    }
    return false;
  };

  const handleCheckboxChange = (value, field, checked) => {
    if (field === 'references') {
      setFormData(prev => ({
        ...prev,
        references: checked 
          ? [...prev.references, value]
          : prev.references.filter(r => r !== value)
      }));
    } else if (field === 'activities') {
      setFormData(prev => ({
        ...prev,
        activities: checked 
          ? [...prev.activities, value]
          : prev.activities.filter(a => a !== value)
      }));
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const { studentName, age, parentName, address, contactNo, emailId, references, activities } = formData;
    
    if (!studentName) { window.alert("⚠️ Student name required"); return; }
    if (!age) { window.alert("⚠️ Student age required"); return; }
    if (!parentName) { window.alert("⚠️ Parent name required"); return; }
    if (!address) { window.alert("⚠️ Address required"); return; }
    if (!contactNo.match(/^\d{10}$/)) { window.alert("📞 Valid 10-digit phone required"); return; }
    if (!emailId.includes('@')) { window.alert("✉️ Valid email required"); return; }
    if (activities.length === 0) { window.alert("Select at least one activity"); return; }
    if (!isSignatureNonEmpty()) { window.alert("Please provide signature"); return; }

    const newInquiryId = "INQ-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    const submittedAt = new Date().toLocaleString();

    const inquiryData = { 
      id: newInquiryId, 
      studentName, 
      age,
      parentName, 
      address, 
      contactNo, 
      emailId, 
      references, 
      activities,
      submittedAt 
    };
    
    const encoded = encodeURIComponent(JSON.stringify(inquiryData));
    const officeLink = `${window.location.origin}${window.location.pathname}?office_mode=true&data=${encoded}`;

    const officeMsg = `🏫 *A ONE NATRAJ ACADEMY* - NEW INQUIRY 🎯
━━━━━━━━━━━━━━━━━━━━━━
🆔 ID: ${newInquiryId}
👨‍🎓 Student: ${studentName}
🎂 Age: ${age}
👨‍👩‍👧 Parent: ${parentName}
📞 Phone: ${contactNo}
💃 Activities: ${activities.join(", ")}
━━━━━━━━━━━━━━━━━━━━━━
📋 *CLICK TO SCHEDULE TRIAL CLASS (OFFICE PANEL):*
${officeLink}`;

    window.open(`https://wa.me/${OFFICE_WHATSAPP}?text=${encodeURIComponent(officeMsg)}`, "_blank");
    
    setInquiryId(newInquiryId);
    setSubmitted(true);
    
    // Reset form
    setFormData({
      studentName: '',
      age: '',
      parentName: '',
      address: '',
      contactNo: '',
      emailId: '',
      references: [],
      activities: []
    });
    clearSignature();
    
    setTimeout(() => setSubmitted(false), 5000);
  };

  // Office Mode Scheduler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('office_mode') === 'true' && urlParams.get('data')) {
      showOfficeScheduler(urlParams.get('data'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showOfficeScheduler = (encodedData) => {
    let inquiry;
    try {
      inquiry = JSON.parse(decodeURIComponent(encodedData));
    } catch(e) {
      inquiry = null;
    }
    
    if (!inquiry || !inquiry.studentName) {
      document.body.innerHTML = `<div style="max-width:600px; margin:50px auto; background:white; border-radius:40px; padding:30px; text-align:center;">
        <h2 style="color:#e76f51;">⚠️ Invalid Link</h2>
        <p>Inquiry data not found. Please ask parent to submit again.</p>
        <button onclick="window.location.href='${window.location.pathname}'" style="padding:12px 24px; background:#2a9d8f; color:white; border:none; border-radius:40px;">Go to Home</button>
      </div>`;
      return;
    }
    
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div class="form-card">
          <div class="form-header" style="background:#2a9d8f;"><h2>📋 OFFICE USE - TRIAL CLASS SCHEDULER</h2></div>
          <div class="form-body">
            <div style="background:#e9f5f2; padding:16px; border-radius:20px; margin-bottom:20px;">
              <p><strong>🆔 ID:</strong> ${inquiry.id}</p>
              <p><strong>Student:</strong> ${inquiry.studentName}</p>
              <p><strong>Age:</strong> ${inquiry.age || 'N/A'}</p>
              <p><strong>Parent:</strong> ${inquiry.parentName}</p>
              <p><strong>Phone:</strong> ${inquiry.contactNo}</p>
              <p><strong>Activities:</strong> ${inquiry.activities.join(", ")}</p>
            </div>
            <div class="input-group"><label>📅 Trial Date *</label><input type="date" id="trialDate"></div>
            <div class="input-group"><label>⏰ Trial Time *</label><input type="time" id="trialTime"></div>
            <div class="input-group"><label>🏷️ Instructions</label><input type="text" id="trialNote" placeholder="e.g., Bring water bottle"></div>
            <button id="sendTrialBtn" class="btn-submit" style="background:#2a9d8f;">📲 Send Confirmation to Client</button>
            <button onclick="window.location.href='${window.location.pathname}'" style="margin-top:15px; width:100%; padding:12px; background:#e9e2d4; border:none; border-radius:40px;">← Back</button>
          </div>
        </div>
      `;
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const trialDateInput = document.getElementById('trialDate');
      const trialTimeInput = document.getElementById('trialTime');
      const sendBtn = document.getElementById('sendTrialBtn');
      
      if (trialDateInput) trialDateInput.value = tomorrow.toISOString().split('T')[0];
      if (trialTimeInput) trialTimeInput.value = "17:00";
      
      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          const date = document.getElementById('trialDate').value;
          const time = document.getElementById('trialTime').value;
          const note = document.getElementById('trialNote').value.trim();
          if (!date || !time) { window.alert("Select date & time"); return; }
          const formatted = new Date(date).toLocaleDateString();
          const msg = `🎉 *A ONE NATRAJ ACADEMY* - Trial Confirmation\n━━━━━━━━━━━━━━━━\nDear ${inquiry.parentName},\n\nTrial for *${inquiry.studentName}* (Age: ${inquiry.age})\n📅 ${formatted} at ${time}\n📍 Venue: A One Natraj Academy\n${note ? `📌 ${note}\n` : ""}\nContact: +91 8587906794\nThank you! 💃`;
          window.open(`https://wa.me/91${inquiry.contactNo}?text=${encodeURIComponent(msg)}`, "_blank");
          window.alert("✅ Confirmation sent to client!");
        });
      }
    }
  };

  return (
    <div className="app-container">
      {/* Student Inquiry Form */}
      <div className="form-card">
        <div className="form-header">
          <img src="https://cdn-icons-png.flaticon.com/512/3039/3039396.png" alt="Logo" />
          <h1>🎭 A ONE NATRAJ ACADEMY</h1>
          <p>Student Inquiry & Trial Registration</p>
        </div>
        <div className="form-body">
          <div className="input-group">
            <label>🧑‍🎓 Student's Full Name *</label>
            <input 
              type="text" 
              id="studentName" 
              value={formData.studentName}
              onChange={handleInputChange}
              placeholder="e.g., Aadhya Sharma" 
            />
          </div>
          
          <div className="input-group">
            <label>🎂 Student's Age *</label>
            <input 
              type="number" 
              id="age" 
              value={formData.age}
              onChange={handleInputChange}
              placeholder="e.g., 8" 
              min="1"
              max="100"
            />
          </div>
          
          <div className="input-group">
            <label>👨‍👩‍👧 Parent/Guardian Name *</label>
            <input 
              type="text" 
              id="parentName" 
              value={formData.parentName}
              onChange={handleInputChange}
              placeholder="Full name" 
            />
          </div>
          
          <div className="section-title">📢 Other References</div>
          <div className="checkbox-group">
            {referenceOptions.map(ref => (
              <label key={ref} className="checkbox-label">
                <input 
                  type="checkbox" 
                  value={ref}
                  checked={formData.references.includes(ref)}
                  onChange={(e) => handleCheckboxChange(ref, 'references', e.target.checked)}
                />
                {ref}
              </label>
            ))}
          </div>

          <div className="input-group">
            <label>🏠 Address *</label>
            <textarea 
              rows="2" 
              id="address" 
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street, City, Pin code"
            />
          </div>
          
          <div className="input-group">
            <label>📞 Contact Number * (10 digit)</label>
            <input 
              type="tel" 
              id="contactNo" 
              maxLength="10" 
              value={formData.contactNo}
              onChange={handleInputChange}
              placeholder="9876543210" 
            />
          </div>
          
          <div className="input-group">
            <label>✉️ Email ID *</label>
            <input 
              type="email" 
              id="emailId" 
              value={formData.emailId}
              onChange={handleInputChange}
              placeholder="parent@example.com" 
            />
          </div>

          <div className="section-title">💃 Activities Interested In *</div>
          <div className="checkbox-group">
            {activityOptions.map(activity => (
              <label key={activity} className="checkbox-label">
                <input 
                  type="checkbox" 
                  value={activity}
                  checked={formData.activities.includes(activity)}
                  onChange={(e) => handleCheckboxChange(activity, 'activities', e.target.checked)}
                />
                {activity}
              </label>
            ))}
          </div>

          <div className="section-title">🖊️ Digital Signature</div>
          <div className="signature-area">
            <canvas 
              ref={canvasRef}
              width="500" 
              height="180" 
              style={{width: '100%', height: 'auto', cursor: 'crosshair'}}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <button 
              type="button" 
              onClick={clearSignature}
              style={{marginTop: '10px', background: '#e9e2d4', border: 'none', padding: '8px 16px', borderRadius: '40px', cursor: 'pointer'}}
            >
              🗑️ Clear
            </button>
          </div>

          <button className="btn-submit" onClick={handleSubmit}>
            📨 Submit Inquiry → Send to Office
          </button>
          
          {submitted && (
            <div className="success-message" style={{display: 'block'}}>
              ✅ Inquiry submitted! ID: {inquiryId}<br />Office will schedule trial and contact you.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;