export async function fetchWorkSchedule(month, year, token) {
  const res = await fetch(
    `/api/Staff/work-schedule?month=${month}&year=${year}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}

export async function fetchMedicalStaffWorkSchedule(month, year, token) {
  const res = await fetch(
    `/api/MedicalStaff/work-schedule?month=${month}&year=${year}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch medical staff schedule");
  return res.json();
} 