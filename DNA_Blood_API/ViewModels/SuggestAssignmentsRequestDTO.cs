using System;
using System.Collections.Generic;

namespace DNA_Blood_API.ViewModels
{
    public class SuggestAssignmentsRequestDTO
    {
        public List<ShiftSimpleDTO> Shifts { get; set; }
        public List<UserSimpleDTO> Users { get; set; }
        public List<DateOnly> Dates { get; set; }
        public int MaxShiftPerMonth { get; set; } = 20;
    }
} 