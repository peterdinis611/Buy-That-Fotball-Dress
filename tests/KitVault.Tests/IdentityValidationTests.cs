using IdentityService.DTOs;
using IdentityService.Validation;
using Xunit;

namespace KitVault.Tests;

public class IdentityValidationTests
{
    private readonly RegisterDtoValidator register = new();
    private readonly LoginDtoValidator login = new();

    [Fact]
    public void Squad_name_with_a_real_password_passes()
    {
        var result = register.Validate(new RegisterDto
        {
            Username = "kitvault",
            Email = "kitvault@kitvault.test",
            Password = "PitchSide!1",
            DisplayName = "Kit Vault"
        });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Short_squad_name_fails()
    {
        var result = register.Validate(new RegisterDto
        {
            Username = "kv",
            Email = "kv@kitvault.test",
            Password = "PitchSide!1"
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void Password_needs_a_digit()
    {
        var result = register.Validate(new RegisterDto
        {
            Username = "new.player",
            Email = "new@kitvault.test",
            Password = "PitchSide!"
        });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void Login_needs_both_fields()
    {
        Assert.False(login.Validate(new LoginDto()).IsValid);
        Assert.True(login.Validate(new LoginDto { Username = "kitvault", Password = "PitchSide!1" }).IsValid);
    }
}
