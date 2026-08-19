import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { ArrowLeft, Edit2, Save, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultPIQ = {
  id: 1,
  board: '', batch: '', rollNo: '', chestNo: '',
  name: '', fatherName: '', motherName: '',
  residenceMax: '', residencePerm: '', residencePresent: '',
  stateDist: '', religion: '', category: '', dob: '', maritalStatus: '',
  parentsStatus: '', separationAge: '', stayingWith: '', parentsAlive: '', deathAge: '',
  family: [
    { relation: 'Father', edu: '', occ: '', inc: '' },
    { relation: 'Mother', edu: '', occ: '', inc: '' },
    { relation: 'Elder Sister', edu: '', occ: '', inc: '' },
    { relation: 'Elder Brother', edu: '', occ: '', inc: '' }
  ],
  education: [
    { class: '10th', stream: '', inst: '', board: '', year: '', marks: '', medium: '', type: '', ach: '' },
    { class: '12th', stream: '', inst: '', board: '', year: '', marks: '', medium: '', type: '', ach: '' },
    { class: 'Graduation', stream: '', inst: '', board: '', year: '', marks: '', medium: '', type: '', ach: '' }
  ],
  age: '', height: '', weight: '',
  occPresent: '', occPast: '',
  nccAttended: '', nccDuration: '', nccWing: '', nccDiv: '', nccCert: '',
  sports: '', hobbies: '', responsibilities: '',
  commission: '', serviceChoice: '', chances: '',
  previousInterviews: '', strengths: '', weaknesses: ''
};

// Helper component to render blue text for filled data, or standard underlines for blanks
const Ans = ({ val, ph = '____________________' }) => (
  val ? <span className="text-blue-700 font-bold whitespace-pre-wrap">{val}</span> : <span className="text-black">{ph}</span>
);

const PIQ = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultPIQ);
  
  const savedPIQ = useLiveQuery(() => db.ssb_piq?.get(1));

 useEffect(() => {
    if (savedPIQ) {
      // Force the database to update the labels while keeping your typed data
      const fixedFamily = savedPIQ.family.map((member, i) => {
        if (i === 0) return { ...member, relation: 'Father' };
        if (i === 1) return { ...member, relation: 'Mother' };
        if (i === 2) return { ...member, relation: 'Elder Sister' };
        if (i === 3) return { ...member, relation: 'Elder Brother' };
        return member;
      });
      setFormData({ ...savedPIQ, family: fixedFamily });
    }
  }, [savedPIQ]);

  const handleSave = async () => {
    if (!db.ssb_piq) return alert("Database not ready!");
    await db.ssb_piq.put({ ...formData, id: 1 });
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleChange = (e, section, index, field) => {
    if (section) {
      const updatedArray = [...formData[section]];
      updatedArray[index][field] = e.target.value;
      setFormData({ ...formData, [section]: updatedArray });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Shared input styling for clear visibility
  const inputStyle = "w-full border border-gray-300 bg-white p-2 rounded text-blue-700 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-300";
  const inputStyleSmall = "w-full border border-gray-300 bg-white p-2 rounded text-blue-700 font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-300";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 print:p-0 print:m-0 print:space-y-0">
      
      {/* Header - Hidden on Print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/ssb/interview" className="p-2 bg-white dark:bg-gray-800 rounded-lg border hover:bg-gray-50 transition"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-blue-600"/> Master PIQ Form</h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"><Save size={16}/> Save PIQ</button>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"><Edit2 size={16}/> Edit Mode</button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg font-bold transition"><Download size={16}/> Save as PDF</button>
            </>
          )}
        </div>
      </div>

      {/* PIQ Document Body */}
      <div className="print-container bg-white text-black p-8 rounded-xl shadow-sm border print:border-none print:shadow-none print:w-full print:p-2" style={{ fontFamily: 'Times New Roman, serif' }}>
        
        {isEditing ? (
          <div className="space-y-6 text-sm bg-blue-50/50 p-6 border border-blue-100 rounded-xl">
            <p className="text-blue-800 font-bold mb-4 text-center text-lg">Edit Mode Active (Your answers are in blue)</p>
            
            {/* Sections 1-4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="font-bold text-gray-700">1. Selection Board & Batch:</label><input name="board" value={formData.board} onChange={handleChange} className={inputStyle}/></div>
              <div><label className="font-bold text-gray-700">UPSC Roll No:</label><input name="rollNo" value={formData.rollNo} onChange={handleChange} className={inputStyle}/></div>
              <div className="md:col-span-2"><label className="font-bold text-gray-700">2. Name (CAPITALS):</label><input name="name" value={formData.name} onChange={handleChange} className={inputStyle}/></div>
              <div><label className="font-bold text-gray-700">3. Father's Name:</label><input name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputStyle}/></div>
              <div><label className="font-bold text-gray-700">4. Mother's Name:</label><input name="motherName" value={formData.motherName} onChange={handleChange} className={inputStyle}/></div>
            </div>

            {/* Section 5 & 6 */}
            <div className="space-y-3">
              <div><label className="font-bold text-gray-700">5. (a) Place of Max Residence:</label><input name="residenceMax" value={formData.residenceMax} onChange={handleChange} className={inputStyle}/></div>
              <div><label className="font-bold text-gray-700">(b) Permanent Residence:</label><input name="residencePerm" value={formData.residencePerm} onChange={handleChange} className={inputStyle}/></div>
              <div><label className="font-bold text-gray-700">(c) Present Residence:</label><input name="residencePresent" value={formData.residencePresent} onChange={handleChange} className={inputStyle}/></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div><label className="font-bold text-xs text-gray-700">State & District</label><input name="stateDist" value={formData.stateDist} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Religion</label><input name="religion" value={formData.religion} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Category (SC/ST/Gen)</label><input name="category" value={formData.category} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Date of Birth</label><input name="dob" value={formData.dob} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Marital Status</label><input name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputStyleSmall}/></div>
            </div>

            {/* Section 7: Family Table */}
            <div>
              <label className="font-bold text-gray-700 mb-2 block">7. Family Details:</label>
              <div className="space-y-2">
                {formData.family.map((member, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2 items-center bg-white p-2 border border-gray-200 rounded">
                    <span className="w-32 font-bold text-xs">{member.relation}</span>
                    <input placeholder="Education" value={member.edu} onChange={e => handleChange(e, 'family', i, 'edu')} className={inputStyleSmall}/>
                    <input placeholder="Occupation" value={member.occ} onChange={e => handleChange(e, 'family', i, 'occ')} className={inputStyleSmall}/>
                    <input placeholder="Income/Month" value={member.inc} onChange={e => handleChange(e, 'family', i, 'inc')} className={inputStyleSmall}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 8: Education Table */}
            <div>
              <label className="font-bold text-gray-700 mb-2 block">8. Education Record:</label>
              <div className="space-y-4">
                {formData.education.map((edu, i) => (
                  <div key={i} className="bg-white p-3 border border-gray-200 rounded space-y-2">
                    <span className="font-bold text-sm text-gray-800">{edu.class}</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <input placeholder="Stream" value={edu.stream} onChange={e => handleChange(e, 'education', i, 'stream')} className={inputStyleSmall}/>
                      <input placeholder="Institution" value={edu.inst} onChange={e => handleChange(e, 'education', i, 'inst')} className={`${inputStyleSmall} md:col-span-2`}/>
                      <input placeholder="Board/Univ" value={edu.board} onChange={e => handleChange(e, 'education', i, 'board')} className={inputStyleSmall}/>
                      <input placeholder="Year" value={edu.year} onChange={e => handleChange(e, 'education', i, 'year')} className={inputStyleSmall}/>
                      <input placeholder="Marks %" value={edu.marks} onChange={e => handleChange(e, 'education', i, 'marks')} className={inputStyleSmall}/>
                      <input placeholder="Medium" value={edu.medium} onChange={e => handleChange(e, 'education', i, 'medium')} className={inputStyleSmall}/>
                      <input placeholder="Day/Boarder" value={edu.type} onChange={e => handleChange(e, 'education', i, 'type')} className={inputStyleSmall}/>
                    </div>
                    <input placeholder="Outstanding Achievement (if any)" value={edu.ach} onChange={e => handleChange(e, 'education', i, 'ach')} className={inputStyleSmall}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections 9-15 */}
            <div className="grid grid-cols-3 gap-4">
              <div><label className="font-bold text-xs text-gray-700">9. Age (Yrs/Mo)</label><input name="age" value={formData.age} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Height (cm)</label><input name="height" value={formData.height} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Weight (kg)</label><input name="weight" value={formData.weight} onChange={handleChange} className={inputStyleSmall}/></div>
            </div>

            <div><label className="font-bold text-gray-700">10. Present/Past Occupation:</label><input name="occPresent" value={formData.occPresent} onChange={handleChange} className={inputStyle}/></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div><label className="font-bold text-xs text-gray-700">11. NCC (Yes/No)</label><input name="nccAttended" value={formData.nccAttended} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Total Training</label><input name="nccDuration" value={formData.nccDuration} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Wing</label><input name="nccWing" value={formData.nccWing} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Division</label><input name="nccDiv" value={formData.nccDiv} onChange={handleChange} className={inputStyleSmall}/></div>
              <div><label className="font-bold text-xs text-gray-700">Certificate</label><input name="nccCert" value={formData.nccCert} onChange={handleChange} className={inputStyleSmall}/></div>
            </div>

            <div className="space-y-3">
              <div><label className="font-bold text-gray-700">12. (a) Sports & Games / (b) Hobbies:</label><textarea name="sports" value={formData.sports} onChange={handleChange} className={`${inputStyleSmall} h-20`} placeholder="List sports, hobbies, extracurriculars..."/></div>
              <div><label className="font-bold text-gray-700">12. (c) Position of Responsibility:</label><input name="responsibilities" value={formData.responsibilities} onChange={handleChange} className={inputStyle}/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-bold text-gray-700">13. Nature of Commission:</label><input name="commission" value={formData.commission} onChange={handleChange} className={inputStyle}/></div>
                <div><label className="font-bold text-gray-700">Choice of Service:</label><input name="serviceChoice" value={formData.serviceChoice} onChange={handleChange} className={inputStyle}/></div>
              </div>
              <div><label className="font-bold text-gray-700">14. Chances availed for commission:</label><input name="chances" value={formData.chances} onChange={handleChange} className={inputStyle}/></div>
              <div><label className="font-bold text-gray-700">15. Previous Interviews Details:</label><textarea name="previousInterviews" value={formData.previousInterviews} onChange={handleChange} className={`${inputStyleSmall} h-20`} placeholder="List previous SSB attempts..."/></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
               <div><label className="font-bold text-gray-700">Key Strengths:</label><textarea name="strengths" value={formData.strengths} onChange={handleChange} className={`${inputStyleSmall} h-16`}/></div>
               <div><label className="font-bold text-gray-700">Key Weaknesses:</label><textarea name="weaknesses" value={formData.weaknesses} onChange={handleChange} className={`${inputStyleSmall} h-16`}/></div>
            </div>

          </div>
        ) : (
          <div className="text-[13px] leading-relaxed space-y-3">
            
            {/* --- PAGE 1 --- */}
            <h2 className="text-center font-bold text-xl underline mb-6">PERSONAL INFORMATION QUESTIONNAIRE</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div><b>1. Selection Board (No. & Place):</b> <Ans val={formData.board} ph="______________________________" /></div>
              <div><b>UPSC Roll No:</b> <Ans val={formData.rollNo} /></div>
            </div>
            
            <div><b>2. Name in CAPITALS:</b> <Ans val={formData.name} ph="____________________________________________________________" /></div>
            <div><b>3. Father's Name:</b> <Ans val={formData.fatherName} ph="____________________________________________________________" /></div>
            <div><b>4. Mother's Name:</b> <Ans val={formData.motherName} ph="____________________________________________________________" /></div>
            
            <div className="mt-4">
              <b>5. (a) Place of Maximum Residence:</b> <Ans val={formData.residenceMax} ph="__________________________________________________" /><br/>
              <b>(b) Place of Permanent Residence:</b> <Ans val={formData.residencePerm} ph="__________________________________________________" /><br/>
              <b>(c) Place of Present Residence:</b> <Ans val={formData.residencePresent} ph="__________________________________________________" />
            </div>

            <table className="w-full border-collapse border border-black mt-4 text-center">
              <tbody>
                <tr className="font-bold border border-black">
                  <td className="border border-black p-1">State & District</td>
                  <td className="border border-black p-1">Religion</td>
                  <td className="border border-black p-1">SC/ST/OBC</td>
                  <td className="border border-black p-1">Date of Birth</td>
                  <td className="border border-black p-1">Marital Status</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 h-8"><Ans val={formData.stateDist} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.religion} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.category} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.dob} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.maritalStatus} ph=" "/></td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4"><b>7. Parents Details:</b></div>
            <table className="w-full border-collapse border border-black mt-1 text-center">
              <tbody>
                <tr className="font-bold border border-black">
                  <td className="border border-black p-1">Particulars</td>
                  <td className="border border-black p-1">Education</td>
                  <td className="border border-black p-1">Occupation</td>
                  <td className="border border-black p-1">Income per month</td>
                </tr>
                {formData.family.map((member, i) => (
                  <tr key={i}>
                    <td className="border border-black p-1 font-bold text-black">{member.relation}</td>
                    <td className="border border-black p-1 h-6"><Ans val={member.edu} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={member.occ} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={member.inc} ph=" "/></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4"><b>8. Education Record:</b></div>
            <table className="w-full border-collapse border border-black mt-1 text-center text-[11px]">
              <tbody>
                <tr className="font-bold border border-black">
                  <td className="border border-black p-1">Class</td>
                  <td className="border border-black p-1">Stream</td>
                  <td className="border border-black p-1">Institution</td>
                  <td className="border border-black p-1">Board/Univ</td>
                  <td className="border border-black p-1">Year</td>
                  <td className="border border-black p-1">Marks %</td>
                  <td className="border border-black p-1">Medium</td>
                  <td className="border border-black p-1">Boarder/Day</td>
                  <td className="border border-black p-1">Achievement</td>
                </tr>
                {formData.education.map((edu, i) => (
                  <tr key={i}>
                    <td className="border border-black p-1 font-bold text-black">{edu.class}</td>
                    <td className="border border-black p-1 h-8"><Ans val={edu.stream} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={edu.inst} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={edu.board} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={edu.year} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={edu.marks} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={edu.medium} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={edu.type} ph=" "/></td>
                    <td className="border border-black p-1"><Ans val={edu.ach} ph=" "/></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- PAGE BREAK FOR 2-PAGE PDF --- */}
            <div className="page-break my-8 border-b-2 border-dashed border-gray-300 print:border-none print:my-0">
               <div className="text-center text-gray-400 text-xs print:hidden mb-2">--- End of Page 1 (Page Break applied for PDF) ---</div>
            </div>

            {/* --- PAGE 2 --- */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div><b>9. Age:</b> <Ans val={formData.age} ph="____________" /></div>
              <div><b>Height:</b> <Ans val={formData.height} ph="____________" /></div>
              <div><b>Weight:</b> <Ans val={formData.weight} ph="____________" /></div>
            </div>

            <div className="mt-3"><b>10. Present/Past Occupation:</b> <Ans val={formData.occPresent} ph="__________________________________________________" /></div>

            <div className="mt-4"><b>11. NCC Training:</b></div>
            <table className="w-full border-collapse border border-black mt-1 text-center">
              <tbody>
                <tr className="font-bold border border-black">
                  <td className="border border-black p-1">Attended?</td>
                  <td className="border border-black p-1">Total Training</td>
                  <td className="border border-black p-1">Wing</td>
                  <td className="border border-black p-1">Division</td>
                  <td className="border border-black p-1">Certificate</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 h-8"><Ans val={formData.nccAttended} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.nccDuration} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.nccWing} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.nccDiv} ph=" "/></td>
                  <td className="border border-black p-1"><Ans val={formData.nccCert} ph=" "/></td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4"><b>12. (a/b) Sports, Hobbies & Extra-Curriculars:</b><br/><Ans val={formData.sports} ph="__________________________________________________________________________________________" /></div>
            <div className="mt-3"><b>12. (c) Position of Responsibility:</b> <Ans val={formData.responsibilities} ph="________________________________________________________" /></div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
               <div><b>13. (a) Nature of Commission:</b> <Ans val={formData.commission} ph="________________________" /></div>
               <div><b>(b) Choice of Service:</b> <Ans val={formData.serviceChoice} ph="________________________" /></div>
            </div>

            <div className="mt-3"><b>14. Chances availed for commission:</b> <Ans val={formData.chances} ph="________________________________" /></div>
            <div className="mt-3"><b>15. Previous Interviews:</b><br/><Ans val={formData.previousInterviews} ph="__________________________________________________________________________________________" /></div>

            {/* Print CSS overrides injected directly */}
            <style type="text/css">
              {`
                @media print {
                  @page { size: A4; margin: 20mm; }
                  body * { visibility: hidden; }
                  .print-container, .print-container * { visibility: visible; }
                  .print-container { position: absolute; left: 0; top: 0; width: 100%; }
                  .page-break { page-break-before: always; margin-top: 20px; }
                }
              `}
            </style>
          </div>
        )}
      </div>
    </div>
  );
};
export default PIQ;
