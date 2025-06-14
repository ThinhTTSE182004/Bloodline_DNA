namespace DNA_API1.ViewModels
{
    public class ParticipantDTO
    {
        public string FullName { get; set; }
        public string Sex { get; set; }
        public DateOnly BirthDate { get; set; }
        public decimal Phone { get; set; }
        public string Relationship { get; set; }
        public string NameRelation { get; set; }
    }
} 