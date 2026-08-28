using FluentValidation;
using IdentityService.DTOs;

namespace IdentityService.Validation;

public static class AuthRules
{
    public const int MinUsernameLength = 3;
    public const int MaxUsernameLength = 32;
    public const int MaxDisplayNameLength = 64;
    public const int MinPasswordLength = 8;
    public const string UsernamePattern = @"^[a-zA-Z0-9._-]+$";
}

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .Length(AuthRules.MinUsernameLength, AuthRules.MaxUsernameLength)
            .Matches(AuthRules.UsernamePattern)
            .WithMessage("Username can only contain letters, numbers, dots, underscores and hyphens.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(AuthRules.MinPasswordLength)
            .Matches("[A-Za-z]").WithMessage("Password must contain a letter.")
            .Matches("[0-9]").WithMessage("Password must contain a digit.");

        RuleFor(x => x.DisplayName)
            .MaximumLength(AuthRules.MaxDisplayNameLength)
            .When(x => !string.IsNullOrWhiteSpace(x.DisplayName));
    }
}

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty();
    }
}
