// App.jsx
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const App = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    studentAge: '',
    address: '',
    contactNo: '',
    references: [],
    activities: []
  });
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isOfficeMode, setIsOfficeMode] = useState(false);
  const [officeInquiry, setOfficeInquiry] = useState(null);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const OFFICE_WHATSAPP = "918587906794";
  const BASE_URL = window.location.origin + window.location.pathname;

  // Reference options
  const referenceOptions = ['Facebook', 'Instagram', 'YouTube', 'Google', 'Friend', 'Other'];
  
  // Activity options
  const activityOptions = [
    'Dance', 'Fitness', 'Music', 'Aerial Dance', 'Gymnastics', 
    'Wedding Choreography', 'Theatre', 'Dance Courses', 'Teaching Courses'
  ];

  // Check for office mode on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const officeMode = urlParams.get('office_mode');
    const encodedData = urlParams.get('data');
    
    if (officeMode === 'true' && encodedData) {
      try {
        const inquiry = JSON.parse(decodeURIComponent(encodedData));
        if (inquiry && inquiry.studentName) {
          setIsOfficeMode(true);
          setOfficeInquiry(inquiry);
        }
      } catch (e) {
        console.error('Failed to decode inquiry data');
      }
    }
  }, []);

  // Initialize signature pad
  useEffect(() => {
    if (isOfficeMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    let width = container.clientWidth;
    if (width > 540) width = 540;
    canvas.width = width;
    canvas.height = 180;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2c3e2f';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctxRef.current = ctx;
    
    const handleResize = () => {
      const newContainer = canvas.parentElement;
      let newWidth = newContainer.clientWidth;
      if (newWidth > 540) newWidth = 540;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = newWidth;
      canvas.height = 180;
      ctx.putImageData(imageData, 0, 0);
      ctx.strokeStyle = '#2c3e2f';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOfficeMode]);

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
    const { studentName, parentName, studentAge, address, contactNo, references, activities } = formData;
    
    if (!studentName) { alert("⚠️ Student name is required"); return; }
    if (!parentName) { alert("⚠️ Parent name is required"); return; }
    if (!studentAge) { alert("🎂 Please enter student's age"); return; }
    const ageNum = parseInt(studentAge);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) { alert("📅 Age must be between 1 and 100 years"); return; }
    if (!address) { alert("🏠 Address is required"); return; }
    if (!contactNo || !/^\d{10}$/.test(contactNo)) { alert("📞 Valid 10-digit mobile number required"); return; }
    if (activities.length === 0) { alert("💃 Please select at least one activity"); return; }
    if (!isSignatureNonEmpty()) { alert("🖊️ Please sign using the signature field"); return; }

    const newInquiryId = "INQ-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
    const submittedAt = new Date().toLocaleString();

    const inquiryData = {
      id: newInquiryId,
      studentName: studentName,
      parentName: parentName,
      studentAge: ageNum,
      address: address,
      contactNo: contactNo,
      references: references,
      activities: activities,
      submittedAt: submittedAt
    };

    const encodedData = encodeURIComponent(JSON.stringify(inquiryData));
    const officeLink = `${BASE_URL}?office_mode=true&data=${encodedData}`;

    // OFFICE WHATSAPP MESSAGE - THIS IS THE ONLY PLACE THE LINK APPEARS
    const officeMessage = `🏫 *A ONE NATRAJ ACADEMY* - NEW INQUIRY 🎭
━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 *ID:* ${newInquiryId}
👨‍🎓 *Student:* ${studentName}
🧒 *Age:* ${ageNum} years
👨‍👩‍👧 *Parent:* ${parentName}
📞 *Phone:* ${contactNo}
💃 *Activities:* ${activities.join(", ")}
📢 *Source:* ${references.join(", ") || "Not specified"}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *CLICK BELOW TO SCHEDULE TRIAL CLASS:*
${officeLink}

After scheduling, the client will automatically receive confirmation.`;

    // Send to office WhatsApp
    window.open(`https://wa.me/${OFFICE_WHATSAPP}?text=${encodeURIComponent(officeMessage)}`, "_blank");

    setInquiryId(newInquiryId);
    setSubmitted(true);
    
    // Reset form
    setFormData({
      studentName: '',
      parentName: '',
      studentAge: '',
      address: '',
      contactNo: '',
      references: [],
      activities: []
    });
    clearSignature();
    
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleScheduleTrial = () => {
    if (!officeInquiry) return;
    
    const trialDate = document.getElementById('trialDate').value;
    const trialTime = document.getElementById('trialTime').value;
    const trialNote = document.getElementById('trialNote').value.trim();
    
    if (!trialDate || !trialTime) {
      alert("⚠️ Please pick both trial date and time.");
      return;
    }
    
    const formattedDate = new Date(trialDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const clientMessage = `🎭 *A ONE NATRAJ ACADEMY* - Your Trial Class is Confirmed 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear ${officeInquiry.parentName},

Trial class for *${officeInquiry.studentName}* (Age: ${officeInquiry.studentAge}) has been scheduled.

📅 *Date:* ${formattedDate}
⏰ *Time:* ${trialTime}
📍 *Venue:* A One Natraj Academy

✅ Bring comfortable attire, sports shoes, and enthusiasm.
${trialNote ? `📌 *Note:* ${trialNote}\n` : "🎯 Reach 10 mins early."}
For queries: +91 8587906794

We can't wait to see you shine! 💫`;
    
    const clientWhatsAppUrl = `https://wa.me/91${officeInquiry.contactNo}?text=${encodeURIComponent(clientMessage)}`;
    window.open(clientWhatsAppUrl, "_blank");
    
    const officeConfirm = `✅ Trial scheduled successfully for ${officeInquiry.studentName} (${officeInquiry.contactNo}) on ${formattedDate} ${trialTime}`;
    setTimeout(() => {
      window.open(`https://wa.me/${OFFICE_WHATSAPP}?text=${encodeURIComponent(officeConfirm)}`, "_blank");
    }, 900);
    
    alert("📲 Confirmation sent to client via WhatsApp!");
  };

  // Office Mode Render
  if (isOfficeMode && officeInquiry) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    
    return (
      <div className="app-wrapper">
        <div className="office-panel">
          <div className="office-header">
            <i className="fas fa-calendar-check"></i> OFFICE DASHBOARD :: SCHEDULE TRIAL
          </div>
          <div className="office-body">
            <div className="client-details">
              <p><span className="detail-label"><i className="fas fa-hashtag"></i> ID:</span> {officeInquiry.id}</p>
              <p><span className="detail-label"><i className="fas fa-user-graduate"></i> Student:</span> {officeInquiry.studentName}</p>
              <p><span className="detail-label"><i className="fas fa-birthday-cake"></i> Age:</span> {officeInquiry.studentAge} years</p>
              <p><span className="detail-label"><i className="fas fa-user-friends"></i> Parent:</span> {officeInquiry.parentName}</p>
              <p><span className="detail-label"><i className="fas fa-phone"></i> Contact:</span> <strong style={{color: '#1e5950'}}>+91{officeInquiry.contactNo}</strong></p>
              <p><span className="detail-label"><i className="fas fa-heart"></i> Activities:</span> {officeInquiry.activities.join(", ")}</p>
              <p><span className="detail-label"><i className="fas fa-map-marker-alt"></i> Address:</span> {officeInquiry.address}</p>
              <p><span className="detail-label"><i className="fas fa-calendar-alt"></i> Submitted:</span> {officeInquiry.submittedAt}</p>
            </div>
            <div style={{background: '#eef3f1', borderRadius: '28px', padding: '16px', marginBottom: '24px'}}>
              <i className="fas fa-lightbulb"></i> <strong>Pro tip:</strong> Select date/time, then send instant WhatsApp confirmation to the parent.
            </div>
            <div className="input-group">
              <label><i className="fas fa-calendar-day"></i> Trial Class Date *</label>
              <input type="date" id="trialDate" defaultValue={defaultDate} style={{width: '100%', padding: '14px', borderRadius: '32px', border: '2px solid #fbdec7'}} />
            </div>
            <div className="input-group">
              <label><i className="fas fa-clock"></i> Trial Class Time *</label>
              <input type="time" id="trialTime" defaultValue="17:30" style={{width: '100%', padding: '14px', borderRadius: '32px', border: '2px solid #fbdec7'}} />
            </div>
            <div className="input-group">
              <label><i className="fas fa-pen"></i> Special Note (optional)</label>
              <input type="text" id="trialNote" placeholder="e.g. Bring water, report at reception" style={{width: '100%', padding: '14px', borderRadius: '32px'}} />
            </div>
            <button className="btn-submit" onClick={handleScheduleTrial} style={{background: '#2a9d8f', marginTop: '10px'}}>
              <i className="fab fa-whatsapp"></i> Send Confirmation to Client
            </button>
            <button onClick={() => window.location.href = BASE_URL} style={{marginTop: '16px', width: '100%', padding: '14px', background: '#e9e2d4', border: 'none', borderRadius: '60px', cursor: 'pointer', fontWeight: '600'}}>
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Inquiry Form - Customer never sees any office link
  return (
    <div className="app-wrapper">
      <div className="form-card">
        <div className="form-header">
          <img src="./logo.jpg" alt="A One Natraj Academy Logo" onError={(e) => e.target.src = 'https://placehold.co/300x100?text=A+One+Natraj+Academy'} />
          <p>🌟 ENQUIRY & ADMISSION PORTAL 🌟</p>
        </div>
        <div className="form-body">
          <div className="input-group">
            <label><i className="fas fa-user-graduate"></i> Student's Full Name *</label>
            <input type="text" id="studentName" value={formData.studentName} onChange={handleInputChange} placeholder="e.g. Aarav Sharma" />
          </div>
          <div className="input-group">
            <label><i className="fas fa-user-friends"></i> Parent/Guardian Name *</label>
            <input type="text" id="parentName" value={formData.parentName} onChange={handleInputChange} placeholder="Full name" />
          </div>
          <div className="input-group">
            <label><i className="fas fa-birthday-cake"></i> Student's Age *</label>
            <input type="number" id="studentAge" value={formData.studentAge} onChange={handleInputChange} placeholder="Enter age (years)" min="1" max="100" step="1" />
            <div style={{fontSize: '0.75rem', marginTop: '6px', color: '#8b6b4d'}}><i className="fas fa-info-circle"></i> Age must be between 1 and 100 years</div>
          </div>
          <div className="section-title"><i className="fas fa-bullhorn"></i> 📢 How did you know about us?</div>
          <div className="checkbox-group">
            {referenceOptions.map(ref => (
              <label key={ref} className="checkbox-label">
                <input type="checkbox" value={ref} checked={formData.references.includes(ref)} onChange={(e) => handleCheckboxChange(ref, 'references', e.target.checked)} />
                {ref === 'Facebook' && <i className="fab fa-facebook"></i>}
                {ref === 'Instagram' && <i className="fab fa-instagram"></i>}
                {ref === 'YouTube' && <i className="fab fa-youtube"></i>}
                {ref === 'Google' && <i className="fab fa-google"></i>}
                {ref === 'Friend' && <i className="fas fa-user-plus"></i>}
                {ref === 'Other' && <i className="fas fa-asterisk"></i>}
                {ref}
              </label>
            ))}
          </div>
          <div className="input-group">
            <label><i className="fas fa-home"></i> Address *</label>
            <textarea rows="2" id="address" value={formData.address} onChange={handleInputChange} placeholder="Complete address with landmark"></textarea>
          </div>
          <div className="input-group">
            <label><i className="fas fa-phone-alt"></i> Contact Number * (10 digit)</label>
            <input type="tel" id="contactNo" value={formData.contactNo} onChange={handleInputChange} placeholder="9876543210" maxLength="10" />
          </div>
          <div className="section-title"><i className="fas fa-heartbeat"></i> 💃 Activities Interested In *</div>
          <div className="checkbox-group">
            {activityOptions.map(activity => (
              <label key={activity} className="checkbox-label">
                <input type="checkbox" value={activity} checked={formData.activities.includes(activity)} onChange={(e) => handleCheckboxChange(activity, 'activities', e.target.checked)} />
                {activity === 'Dance' && '💃'} {activity === 'Fitness' && '💪'} {activity === 'Music' && '🎵'}
                {activity === 'Aerial Dance' && '🧗'} {activity === 'Gymnastics' && '🤸'} {activity === 'Wedding Choreography' && '💍'}
                {activity === 'Theatre' && '🎭'} {activity === 'Dance Courses' && '📚'} {activity === 'Teaching Courses' && '🎓'}
                {activity}
              </label>
            ))}
          </div>
          <div className="section-title"><i className="fas fa-pen-fancy"></i> 🖊️ Digital Signature (Parent/Guardian)</div>
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
            <button className="sig-btn" onClick={clearSignature}><i className="fas fa-eraser"></i> Clear Signature</button>
          </div>
          <button className="btn-submit" onClick={handleSubmit} disabled={submitted}>
            <i className="fas fa-paper-plane"></i> {submitted ? 'Submitted!' : 'Submit Inquiry'}
          </button>
          {submitted && (
            <div className="success-message" style={{display: 'block'}}>
              ✅ <strong>✨ Inquiry submitted successfully!</strong><br /><br />
              🆔 <strong>Inquiry ID:</strong> {inquiryId}<br />
              🧒 <strong>Student Age:</strong> {formData.studentAge} years<br /><br />
              📢 Our office has received your request. You will receive trial class confirmation <strong>within 24 hours</strong> on WhatsApp.<br /><br />
              💡 Please keep the inquiry ID for reference. Thank you for choosing A One Natraj Academy! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;