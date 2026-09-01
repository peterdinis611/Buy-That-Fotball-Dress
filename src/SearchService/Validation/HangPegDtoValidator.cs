using FluentValidation;
using SearchService.DTOs;

namespace SearchService.Validation;

public class HangPegDtoValidator : AbstractValidator<HangPegDto>
{
    public HangPegDtoValidator()
    {
        RuleFor(x => x.Club)
            .MaximumLength(JerseyRules.MaxNameLength)
            .When(x => !string.IsNullOrWhiteSpace(x.Club));

        RuleFor(x => x.League)
            .MaximumLength(JerseyRules.MaxLeagueLength)
            .When(x => !string.IsNullOrWhiteSpace(x.League));

        RuleFor(x => x.Size)
            .Must(size => JerseyRules.Sizes.Contains(size!, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.Size));

        RuleFor(x => x.KitType)
            .Must(type => JerseyRules.KitTypes.Contains(type!, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.KitType));

        RuleFor(x => x.Status)
            .Must(status => JerseyRules.Statuses.Contains(status!, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.Status));

        RuleFor(x => x.MinPrice).GreaterThanOrEqualTo(0).When(x => x.MinPrice is not null);
        RuleFor(x => x.MaxPrice).GreaterThanOrEqualTo(0).When(x => x.MaxPrice is not null);
        RuleFor(x => x)
            .Must(x => x.MinPrice is null || x.MaxPrice is null || x.MinPrice <= x.MaxPrice)
            .WithMessage("MinPrice cannot be greater than MaxPrice.")
            .OverridePropertyName(nameof(HangPegDto.MinPrice));

        RuleFor(x => x)
            .Must(x =>
                !string.IsNullOrWhiteSpace(x.Club)
                || !string.IsNullOrWhiteSpace(x.League)
                || !string.IsNullOrWhiteSpace(x.Size)
                || !string.IsNullOrWhiteSpace(x.KitType)
                || x.MinPrice is not null
                || x.MaxPrice is not null)
            .WithMessage("Hang a filter — club, league, size, kit, or price.")
            .OverridePropertyName(nameof(HangPegDto.Club));
    }
}
