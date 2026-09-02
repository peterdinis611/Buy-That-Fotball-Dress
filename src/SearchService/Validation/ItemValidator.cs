using FluentValidation;
using SearchService.Models;

namespace SearchService.Validation;

public class ItemValidator : AbstractValidator<Item>
{
    public ItemValidator()
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.ReservePrice)
            .InclusiveBetween(0, JerseyRules.MaxReservePrice);

        RuleFor(x => x.Seller)
            .NotEmpty()
            .Length(JerseyRules.MinNameLength, JerseyRules.MaxNameLength)
            .Must(NotContainControlChars)
            .WithMessage("Seller contains invalid characters.");

        RuleFor(x => x.Winner)
            .MaximumLength(JerseyRules.MaxNameLength)
            .When(x => x.Winner is not null);

        RuleFor(x => x.SoldAmount)
            .GreaterThanOrEqualTo(0)
            .When(x => x.SoldAmount is not null);

        RuleFor(x => x.CurrentHighBid)
            .GreaterThanOrEqualTo(0)
            .When(x => x.CurrentHighBid is not null);

        RuleFor(x => x.CreatedAt)
            .NotEqual(default(DateTime));

        RuleFor(x => x.UpdatedAt)
            .NotEqual(default(DateTime));

        RuleFor(x => x.AuctionEnd)
            .NotEqual(default(DateTime));

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(status => JerseyRules.Statuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of: {string.Join(", ", JerseyRules.Statuses)}.");

        RuleFor(x => x.Club)
            .NotEmpty()
            .Length(JerseyRules.MinNameLength, JerseyRules.MaxNameLength)
            .Matches(JerseyRules.NamePattern)
            .WithMessage("Club contains invalid characters.");

        RuleFor(x => x.PlayerName)
            .NotEmpty()
            .Length(JerseyRules.MinNameLength, JerseyRules.MaxNameLength)
            .Matches(JerseyRules.NamePattern)
            .WithMessage("Player name contains invalid characters.");

        RuleFor(x => x.PlayerNumber)
            .InclusiveBetween(0, 99)
            .When(x => x.PlayerNumber is not null);

        RuleFor(x => x.Season)
            .NotEmpty()
            .Matches(JerseyRules.SeasonPattern)
            .WithMessage("Season must look like 2024 or 2024/25.");

        RuleFor(x => x.Size)
            .NotEmpty()
            .Must(size => JerseyRules.Sizes.Contains(size, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Size must be one of: {string.Join(", ", JerseyRules.Sizes)}.");

        RuleFor(x => x.PitToPit)
            .InclusiveBetween(1, 120)
            .When(x => x.PitToPit is not null);

        RuleFor(x => x.BackLength)
            .InclusiveBetween(1, 120)
            .When(x => x.BackLength is not null);

        RuleFor(x => x.BackNumber)
            .InclusiveBetween(1, 80)
            .When(x => x.BackNumber is not null);

        RuleFor(x => x.Color)
            .NotEmpty()
            .Length(JerseyRules.MinNameLength, JerseyRules.MaxColorLength);

        RuleFor(x => x.KitType)
            .NotEmpty()
            .Must(type => JerseyRules.KitTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Kit type must be one of: {string.Join(", ", JerseyRules.KitTypes)}.");

        RuleFor(x => x.Condition)
            .NotEmpty()
            .Must(condition => JerseyRules.Conditions.Contains(condition, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Condition must be one of: {string.Join(", ", JerseyRules.Conditions)}.");

        RuleFor(x => x.League)
            .MaximumLength(JerseyRules.MaxLeagueLength)
            .When(x => x.League is not null);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(JerseyRules.MaxImageUrlLength)
            .Must(BeHttpsUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.ImageUrl))
            .WithMessage("Image URL must be an HTTPS URL.");

        RuleFor(x => x.Match)
            .MaximumLength(JerseyRules.MaxMatchLength)
            .When(x => x.Match is not null);

        RuleFor(x => x.Opponent)
            .MaximumLength(JerseyRules.MaxNameLength)
            .When(x => x.Opponent is not null);

        RuleFor(x => x.PitchPhotoUrl)
            .MaximumLength(JerseyRules.MaxImageUrlLength)
            .Must(BeHttpsUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.PitchPhotoUrl))
            .WithMessage("Pitch photo URL must be an HTTPS URL.");

        RuleFor(x => x.CollarPhotoUrl)
            .MaximumLength(JerseyRules.MaxImageUrlLength)
            .Must(BeHttpsUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.CollarPhotoUrl))
            .WithMessage("Collar photo URL must be an HTTPS URL.");

        RuleFor(x => x.WashPhotoUrl)
            .MaximumLength(JerseyRules.MaxImageUrlLength)
            .Must(BeHttpsUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.WashPhotoUrl))
            .WithMessage("Wash photo URL must be an HTTPS URL.");

        RuleFor(x => x.LabelPhotoUrl)
            .MaximumLength(JerseyRules.MaxImageUrlLength)
            .Must(BeHttpsUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.LabelPhotoUrl))
            .WithMessage("Label photo URL must be an HTTPS URL.");

        RuleFor(x => x.CoaUrl)
            .MaximumLength(JerseyRules.MaxImageUrlLength)
            .Must(BeHttpsUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.CoaUrl))
            .WithMessage("COA URL must be an HTTPS URL.");

        RuleFor(x => x.VerifiedBy)
            .MaximumLength(JerseyRules.MaxNameLength)
            .When(x => x.VerifiedBy is not null);
    }

    private static bool NotContainControlChars(string value) =>
        value.All(c => !char.IsControl(c));

    private static bool BeHttpsUrl(string? url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps;
}
