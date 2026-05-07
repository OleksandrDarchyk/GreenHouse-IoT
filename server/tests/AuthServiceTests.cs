using Xunit;

namespace Tests;

public class PasswordServiceTests
{
    private readonly IPasswordService _sut = new PasswordService();

    [Fact]
    public void Hash_Returns_NonEmpty_String()
    {
        var hash = _sut.Hash("MyPassword123!");
        Assert.False(string.IsNullOrWhiteSpace(hash));
    }

    [Fact]
    public void Hash_Is_Different_From_PlainText()
    {
        const string password = "MyPassword123!";
        var hash = _sut.Hash(password);
        Assert.NotEqual(password, hash);
    }

    [Fact]
    public void Verify_Returns_True_For_Correct_Password()
    {
        const string password = "MyPassword123!";
        var hash = _sut.Hash(password);
        Assert.True(_sut.Verify(password, hash));
    }

    [Fact]
    public void Verify_Returns_False_For_Wrong_Password()
    {
        var hash = _sut.Hash("CorrectPassword");
        Assert.False(_sut.Verify("WrongPassword", hash));
    }

    [Fact]
    public void Hash_Throws_For_Empty_Password()
    {
        Assert.Throws<ArgumentException>(() => _sut.Hash(""));
    }

    [Fact]
    public void Two_Hashes_Of_Same_Password_Are_Different()
    {
        var h1 = _sut.Hash("SamePassword");
        var h2 = _sut.Hash("SamePassword");
        Assert.NotEqual(h1, h2);
        Assert.True(_sut.Verify("SamePassword", h1));
        Assert.True(_sut.Verify("SamePassword", h2));
    }
}