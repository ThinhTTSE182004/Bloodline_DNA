using System.ComponentModel.DataAnnotations;
public class RequiredIfAttribute : ValidationAttribute
{
    private readonly string _propertyName;
    private readonly object _desiredValue;

    public RequiredIfAttribute(string propertyName, object desiredValue)
    {
        _propertyName = propertyName;
        _desiredValue = desiredValue;
    }

    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        // Lấy giá trị thuộc tính điều kiện
        var property = validationContext.ObjectType.GetProperty(_propertyName);
        if (property == null)
            return new ValidationResult($"Không tìm thấy thuộc tính {_propertyName}");

        var propertyValue = property.GetValue(validationContext.ObjectInstance);

        // So sánh giá trị thuộc tính điều kiện với giá trị mong muốn
        if (propertyValue != null && propertyValue.ToString().ToLower() == _desiredValue.ToString().ToLower())
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return new ValidationResult(ErrorMessage);
        }

        return ValidationResult.Success;
    }
}