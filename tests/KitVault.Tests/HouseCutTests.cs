using SettlementService;
using Xunit;

namespace KitVault.Tests;

public class HouseCutTests
{
    [Fact]
    public void Desk_is_ten_percent_of_hammer()
    {
        Assert.Equal(62, HouseCut.Desk(620));
        Assert.Equal(682, HouseCut.Due(620));
    }

    [Fact]
    public void Desk_never_goes_to_zero_on_a_real_hammer()
    {
        Assert.Equal(1, HouseCut.Desk(1));
        Assert.Equal(0, HouseCut.Desk(0));
    }
}
