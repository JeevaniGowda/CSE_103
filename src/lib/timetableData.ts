
export const studentTimetable = {
  className: "Year 1 - CS",
  days: [
    {
      day: "Monday",
      dayKey: "mon",
      periods: [
        { time: "9-10", subject: "DBMS", teacher: "Ravi" },
        { time: "10-11", subject: "OS", teacher: "Smitha" },
        { time: "11-12", subject: "CN", teacher: "Suma" },
        { time: "12-1", subject: "FREE", teacher: null }
      ]
    },
    {
      day: "Tuesday",
      dayKey: "tue",
      periods: [
        { time: "9-10", subject: "CN", teacher: "Duma" },
        { time: "10-11", subject: "FREE", teacher: null },
        { time: "11-12", subject: "DBMS", teacher: "Ravi" },
        { time: "12-1", subject: "OS", teacher: "Smitha" }
      ]
    },
    {
      day: "Wednesday",
      dayKey: "wed",
      periods: [
        { time: "9-10", subject: "OS", teacher: "Smitha" },
        { time: "10-11", subject: "FREE", teacher: null },
        { time: "11-12", subject: "CN", teacher: "Duma" },
        { time: "12-1", subject: "DBMS", teacher: "Ravi" }
      ]
    },
    {
      day: "Thursday",
      dayKey: "thu",
      periods: [
        { time: "9-10", subject: "DBMS", teacher: "Ravi" },
        { time: "10-11", subject: "OS", teacher: "Smitha" },
        { time: "11-12", subject: "FREE", teacher: null },
        { time: "12-1", subject: "CN", teacher: "Duma" }
      ]
    },
    {
      day: "Friday",
      dayKey: "fri",
      periods: [
        { time: "9-10", subject: "FREE", teacher: null },
        { time: "10-11", subject: "CN", teacher: "Duma" },
        { time: "11-12", subject: "DBMS", teacher: "Ravi" },
        { time: "12-1", subject: "OS", teacher: "Smitha" }
      ]
    }
  ]
};

export const teachers = [
  { id: "T1", name: "Ravi", subject: "DBMS" },
  { id: "T2", name: "Smitha", subject: "OS" },
  { id: "T3", name: "Duma", subject: "CN" }
];

export const getTeacherSchedule = (teacherName: string) => {
  const schedule: any[] = [];
  studentTimetable.days.forEach(dayObj => {
    dayObj.periods.forEach(period => {
      if (period.teacher?.toLowerCase() === teacherName?.toLowerCase()) {
        schedule.push({
          day: dayObj.day,
          dayKey: dayObj.dayKey,
          time: period.time,
          className: studentTimetable.className,
          subject: period.subject
        });
      }
    });
  });
  return schedule;
};

// Also calculate FREE slots for teachers
// For this demo, we'll assume teachers are free when they don't have a class'
export const getTeacherFreeSlots = (teacherName: string) => {
  const allTimes = ["9-10", "10-11", "11-12", "12-1"];
  const freeSlots: any[] = [];

  studentTimetable.days.forEach(dayObj => {
    allTimes.forEach(time => {
      const isTeaching = dayObj.periods.some(p => p.time === time && p.teacher?.toLowerCase() === teacherName?.toLowerCase());
      if (!isTeaching) {
        freeSlots.push({
          day: dayObj.day,
          dayKey: dayObj.dayKey,
          time: time
        });
      }
    });
  });

  return freeSlots;
};
