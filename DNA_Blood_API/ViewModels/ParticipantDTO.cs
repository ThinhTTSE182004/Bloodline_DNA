using System.ComponentModel.DataAnnotations;

namespace DNA_API1.ViewModels
{
    public class CreateParticipantDTO
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Giới tính không được để trống")]
        public string Sex { get; set; }

        [Required(ErrorMessage = "Ngày sinh không được để trống")]
        public DateOnly BirthDate { get; set; }

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        [RegularExpression(@"^[0-9]{10,11}$", ErrorMessage = "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Mối quan hệ không được để trống")]
        public string Relationship { get; set; }

        [Required(ErrorMessage = "Tên người thân không được để trống")]
        public string NameRelation { get; set; }

        // Phương thức chuyển đổi từ string sang decimal
        public decimal GetPhoneAsDecimal()
        {
            if (decimal.TryParse(Phone, out decimal result))
            {
                return result;
            }
            return 0;
        }
    }
} 