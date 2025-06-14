using System.ComponentModel.DataAnnotations;

namespace DNA_API1.ViewModels
{
    public class ParticipantDTO
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Giới tính không được để trống")]
        public string Sex { get; set; }

        [Required(ErrorMessage = "Ngày sinh không được để trống")]
        public DateOnly BirthDate { get; set; }

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        [Range(100000000, 999999999999, ErrorMessage = "Số điện thoại không hợp lệ (không được bắt đầu bằng 0)")]
        public decimal Phone { get; set; }

        [Required(ErrorMessage = "Mối quan hệ không được để trống")]
        public string Relationship { get; set; }

        [Required(ErrorMessage = "Tên người thân không được để trống")]
        public string NameRelation { get; set; }
    }
} 