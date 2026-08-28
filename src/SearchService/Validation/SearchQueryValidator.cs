using FluentValidation;
using SearchService.DTOs;

namespace SearchService.Validation;

public class SearchQueryValidator : AbstractValidator<SearchQuery>
{
    public SearchQueryValidator()
    {
        RuleFor(x => x.Club)
            .MaximumLength(JerseyRules.MaxNameLength)
            .Matches(JerseyRules.NamePattern)
            .When(x => !string.IsNullOrWhiteSpace(x.Club))
            .WithMessage("Club contains invalid characters.");

        RuleFor(x => x.PlayerName)
            .MaximumLength(JerseyRules.MaxNameLength)
            .Matches(JerseyRules.NamePattern)
            .When(x => !string.IsNullOrWhiteSpace(x.PlayerName))
            .WithMessage("Player name contains invalid characters.");

        RuleFor(x => x.Status)
            .Must(status => JerseyRules.Statuses.Contains(status!, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.Status))
            .WithMessage($"Status must be one of: {string.Join(", ", JerseyRules.Statuses)}.");

        RuleFor(x => x.Size)
            .Must(size => JerseyRules.Sizes.Contains(size!, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.Size))
            .WithMessage($"Size must be one of: {string.Join(", ", JerseyRules.Sizes)}.");

        RuleFor(x => x.KitType)
            .Must(type => JerseyRules.KitTypes.Contains(type!, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.KitType))
            .WithMessage($"Kit type must be one of: {string.Join(", ", JerseyRules.KitTypes)}.");

        RuleFor(x => x.Condition)
            .Must(condition => JerseyRules.Conditions.Contains(condition!, StringComparer.OrdinalIgnoreCase))
            .When(x => !string.IsNullOrWhiteSpace(x.Condition))
            .WithMessage($"Condition must be one of: {string.Join(", ", JerseyRules.Conditions)}.");

        RuleFor(x => x.Season)
            .Matches(JerseyRules.SeasonPattern)
            .When(x => !string.IsNullOrWhiteSpace(x.Season))
            .WithMessage("Season must look like 2024 or 2024/25.");

        RuleFor(x => x.MinPrice)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MinPrice is not null);

        RuleFor(x => x.MaxPrice)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MaxPrice is not null);

        RuleFor(x => x)
            .Must(x => x.MinPrice is null || x.MaxPrice is null || x.MinPrice <= x.MaxPrice)
            .WithMessage("MinPrice cannot be greater than MaxPrice.")
            .OverridePropertyName(nameof(SearchQuery.MinPrice));

        RuleFor(x => x.Page)
            .InclusiveBetween(JerseyRules.MinPage, JerseyRules.MaxPage);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(JerseyRules.MinPageSize, JerseyRules.MaxPageSize);
    }
}
