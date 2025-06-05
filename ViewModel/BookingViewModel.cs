using System.ComponentModel.DataAnnotations;
using Login.Models;
using Login.Validation;
namespace Login.ViewModel;

[ValidateCollectionMethod]
public class BookingViewModel
{
    public int SelectedServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn loại hình xét nghiệm")]
    public string TestType { get; set; } = string.Empty;

    public decimal Price { get; set; }

    [Required(ErrorMessage = "Vui lòng chọn hình thức lấy mẫu")]
    public string SampleMethod { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn loại mẫu")]
    public string SampleType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập họ tên người đăng ký")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn mối quan hệ")]
    public string Relationship { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập tên người liên quan")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn giới tính")]
    public string Sex { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập ngày sinh")]
    public DateTime BirthDate { get; set; }
}
