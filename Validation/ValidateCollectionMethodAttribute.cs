using System.ComponentModel.DataAnnotations;
using Login.Models;
using Microsoft.EntityFrameworkCore;
using Login.ViewModel;

namespace Login.Validation;

[AttributeUsage(AttributeTargets.Class)]
public class ValidateCollectionMethodAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var model = value as BookingViewModel;
        if (model == null)
        {
            return new ValidationResult("Invalid model type");
        }

        var dbContext = (BloodlineDnaContext)validationContext.GetService(typeof(BloodlineDnaContext))!;

        // Tìm TestType theo tên
        var testType = dbContext.TestTypes.FirstOrDefault(t => t.Name == model.TestType);
        if (testType == null)
        {
            return new ValidationResult("Loại hình xét nghiệm không hợp lệ");
        }

        // Kiểm tra sự tồn tại của collection method với TestType đã tìm được
        var exists = dbContext.CollectionMethods.Any(c =>
            c.MethodName == model.SampleMethod &&
            c.TestTypeId == testType.TestTypeId);

        if (!exists)
        {
            return new ValidationResult("Loại hình xét nghiệm và hình thức lấy mẫu không hợp lệ hoặc không khớp với nhau");
        }

        return ValidationResult.Success;
    }
}