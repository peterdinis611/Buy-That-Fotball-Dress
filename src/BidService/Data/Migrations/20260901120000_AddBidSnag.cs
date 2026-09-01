using BidService.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BidService.Data.Migrations
{
    [DbContext(typeof(BidDbContext))]
    [Migration("20260901120000_AddBidSnag")]
    public partial class AddBidSnag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(name: "MaxAmount", table: "Bids", type: "INTEGER", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "Snag", table: "Bids", type: "INTEGER", nullable: false, defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "MaxAmount", table: "Bids");
            migrationBuilder.DropColumn(name: "Snag", table: "Bids");
        }
    }
}
